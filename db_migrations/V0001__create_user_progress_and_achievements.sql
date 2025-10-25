-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица прогресса по темам
CREATE TABLE IF NOT EXISTS topic_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    topic_name VARCHAR(100) NOT NULL,
    progress_percent INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    total_tasks INTEGER DEFAULT 0,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, topic_name)
);

-- Таблица достижений
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    xp_reward INTEGER DEFAULT 0
);

-- Таблица полученных достижений пользователей
CREATE TABLE IF NOT EXISTS user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    achievement_code VARCHAR(50) NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_code)
);

-- Таблица истории чатов
CREATE TABLE IF NOT EXISTS chat_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    role VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    topic VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Вставка начальных достижений
INSERT INTO achievements (code, title, description, icon, xp_reward) VALUES
('first_question', 'Первый вопрос', 'Задал первый вопрос AI-репетитору', 'MessageSquare', 10),
('streak_3', 'Три дня подряд', 'Занимался 3 дня подряд', 'Flame', 30),
('streak_7', 'Неделя занятий', 'Занимался 7 дней подряд', 'Award', 70),
('topic_master', 'Мастер темы', 'Завершил тему на 100%', 'Trophy', 50),
('level_5', 'Уровень 5', 'Достиг 5-го уровня', 'Star', 100),
('fast_learner', 'Быстрый ученик', 'Решил 10 задач за день', 'Zap', 40),
('problem_solver', 'Решатель задач', 'Решил 50 задач всего', 'Brain', 150),
('night_owl', 'Сова', 'Занимался после полуночи', 'Moon', 20),
('early_bird', 'Жаворонок', 'Занимался до 7 утра', 'Sun', 20),
('perfectionist', 'Перфекционист', 'Решил 5 задач подряд без ошибок', 'Target', 60)
ON CONFLICT (code) DO NOTHING;

-- Тестовый пользователь
INSERT INTO users (username, email, level, xp, streak_days) VALUES
('demo_user', 'demo@mathai.com', 3, 450, 7)
ON CONFLICT (username) DO NOTHING;