'''
Business: Управление прогрессом пользователя, уровнями и достижениями
Args: event - dict с httpMethod, queryStringParameters (user_id) или body
Returns: HTTP response с данными прогресса
'''
import json
import os
from typing import Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(os.environ.get('DATABASE_URL'))
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            user_id: int = int(params.get('user_id', 1))
            
            cur.execute("""
                SELECT id, username, level, xp, streak_days, created_at
                FROM users WHERE id = %s
            """, (user_id,))
            user = cur.fetchone()
            
            if not user:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            cur.execute("""
                SELECT topic_name, progress_percent, completed_tasks, total_tasks
                FROM topic_progress
                WHERE user_id = %s
                ORDER BY last_activity DESC
            """, (user_id,))
            topics = cur.fetchall()
            
            cur.execute("""
                SELECT a.code, a.title, a.description, a.icon, a.xp_reward,
                       ua.earned_at IS NOT NULL as earned
                FROM achievements a
                LEFT JOIN user_achievements ua ON a.code = ua.achievement_code AND ua.user_id = %s
                ORDER BY a.xp_reward DESC
            """, (user_id,))
            achievements = cur.fetchall()
            
            cur.close()
            conn.close()
            
            next_level_xp = user['level'] * 100
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': dict(user),
                    'topics': [dict(t) for t in topics],
                    'achievements': [dict(a) for a in achievements],
                    'next_level_xp': next_level_xp
                }, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            user_id = body_data.get('user_id', 1)
            
            if action == 'add_xp':
                xp_amount = body_data.get('xp', 10)
                
                cur.execute("""
                    UPDATE users 
                    SET xp = xp + %s
                    WHERE id = %s
                    RETURNING level, xp
                """, (xp_amount, user_id))
                result = cur.fetchone()
                
                new_level = result['xp'] // 100 + 1
                if new_level > result['level']:
                    cur.execute("""
                        UPDATE users SET level = %s WHERE id = %s
                    """, (new_level, user_id))
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'xp': result['xp'] + xp_amount,
                        'level': new_level,
                        'level_up': new_level > result['level']
                    }),
                    'isBase64Encoded': False
                }
            
            elif action == 'update_topic':
                topic_name = body_data.get('topic_name')
                progress = body_data.get('progress', 0)
                
                cur.execute("""
                    INSERT INTO topic_progress (user_id, topic_name, progress_percent, total_tasks)
                    VALUES (%s, %s, %s, 10)
                    ON CONFLICT (user_id, topic_name)
                    DO UPDATE SET 
                        progress_percent = %s,
                        completed_tasks = (%s * 10 / 100),
                        last_activity = CURRENT_TIMESTAMP
                """, (user_id, topic_name, progress, progress, progress))
                
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'success': True}),
                    'isBase64Encoded': False
                }
            
            cur.close()
            conn.close()
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
        
        cur.close()
        conn.close()
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
