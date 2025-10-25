'''
Business: AI-репетитор по математике с пошаговыми объяснениями через OpenAI
Args: event - dict с httpMethod, body (user_id, message)
Returns: HTTP response с ответом AI
'''
import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    user_message: str = body_data.get('message', '')
    user_id: int = body_data.get('user_id', 1)
    
    if not user_message:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Message is required'}),
            'isBase64Encoded': False
        }
    
    try:
        import openai
        
        openai.api_key = os.environ.get('OPENAI_API_KEY')
        
        response = openai.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """Ты — опытный репетитор по математике. Твоя задача:
1. Давать ПОШАГОВЫЕ объяснения, а не просто ответы
2. Использовать простой язык и примеры из жизни
3. Разбивать сложные задачи на простые шаги
4. Подбадривать ученика и мотивировать
5. Если ученик ошибся — объяснить, где и почему
6. Использовать эмодзи для визуального разделения шагов

Формат ответа:
**Шаг 1:** [объяснение]
**Шаг 2:** [объяснение]
**Ответ:** [финальный результат]

Будь дружелюбным и терпеливым учителем!"""
                },
                {
                    "role": "user",
                    "content": user_message
                }
            ],
            max_tokens=800,
            temperature=0.7
        )
        
        ai_response = response.choices[0].message.content
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'response': ai_response,
                'user_id': user_id
            }),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': f'AI error: {str(e)}',
                'fallback_response': 'Отличный вопрос! Давай разберём по шагам:\n\n**Шаг 1:** Определим, что нам дано\n**Шаг 2:** Выберем подходящий метод решения\n**Шаг 3:** Применим формулу и получим ответ\n\n💡 Попробуй переформулировать вопрос, чтобы я мог помочь лучше!'
            }),
            'isBase64Encoded': False
        }
