import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Topic {
  id: string;
  title: string;
  progress: number;
  subtopics: number;
}

export default function Index() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Привет! Я твой AI-репетитор по математике. Задай мне вопрос или попроси решить задачу — я объясню всё пошагово! 📐'
    }
  ]);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'topics' | 'practice'>('chat');

  const topics: Topic[] = [
    { id: '1', title: 'Алгебра', progress: 65, subtopics: 12 },
    { id: '2', title: 'Геометрия', progress: 40, subtopics: 8 },
    { id: '3', title: 'Тригонометрия', progress: 25, subtopics: 6 },
    { id: '4', title: 'Математический анализ', progress: 10, subtopics: 15 },
    { id: '5', title: 'Теория вероятностей', progress: 0, subtopics: 7 },
    { id: '6', title: 'Линейная алгебра', progress: 0, subtopics: 10 }
  ];

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const responses = [
        'Отличный вопрос! Давай разберём по шагам:\n\n**Шаг 1:** Упростим выражение\n**Шаг 2:** Приведём подобные слагаемые\n**Шаг 3:** Получим окончательный ответ\n\nВ данном случае нужно помнить, что...',
        'Для решения этой задачи используем формулу:\n\n`ax² + bx + c = 0`\n\nДискриминант находится как: `D = b² - 4ac`\n\nПодставим значения и получим...',
        'Это классическая задача! Разобьём её на простые части:\n\n1️⃣ Определим известные величины\n2️⃣ Выберем подходящий метод решения\n3️⃣ Проверим результат\n\nГотов продолжить?'
      ];
      
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: responses[Math.floor(Math.random() * responses.length)]
      };
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);

    setInput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#1A1F2C] to-[#0EA5E9]/10">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#0EA5E9] to-[#8B5CF6] rounded-xl flex items-center justify-center">
                <Icon name="GraduationCap" className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">MathAI</h1>
                <p className="text-sm text-white/60">Персональный репетитор</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                <Icon name="Flame" size={14} className="mr-1" />
                7 дней подряд
              </Badge>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-white/95 backdrop-blur border-white/20 shadow-2xl overflow-hidden">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'chat'
                      ? 'bg-white text-[#0EA5E9] border-b-2 border-[#0EA5E9]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon name="MessageSquare" size={16} className="inline mr-2" />
                  AI-Репетитор
                </button>
                <button
                  onClick={() => setActiveTab('practice')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'practice'
                      ? 'bg-white text-[#0EA5E9] border-b-2 border-[#0EA5E9]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon name="PenTool" size={16} className="inline mr-2" />
                  Практика
                </button>
              </div>
            </div>

            {activeTab === 'chat' && (
              <div className="flex flex-col h-[600px]">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-[#0EA5E9] to-[#0EA5E9]/90 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-line">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Введи свой вопрос или задачу..."
                      className="flex-1 border-gray-300 focus:border-[#0EA5E9]"
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] hover:opacity-90"
                    >
                      <Icon name="Send" size={18} />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Совет: Опиши задачу подробно, чтобы получить развёрнутое объяснение
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'practice' && (
              <div className="p-6 space-y-6">
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#8B5CF6]/20 to-[#0EA5E9]/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Icon name="Calculator" size={32} className="text-[#8B5CF6]" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Генератор задач</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Выбери тему из карты обучения, и я создам для тебя уникальные задачи с пошаговым решением
                  </p>
                  <Button className="bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6]">
                    <Icon name="Sparkles" size={16} className="mr-2" />
                    Создать задачу
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4 border-2 border-[#0EA5E9]/20 hover:border-[#0EA5E9] cursor-pointer transition-colors">
                    <div className="text-2xl mb-2">📊</div>
                    <h4 className="font-semibold text-sm">Уравнения</h4>
                    <p className="text-xs text-gray-500">12 задач</p>
                  </Card>
                  <Card className="p-4 border-2 border-gray-200 hover:border-[#8B5CF6] cursor-pointer transition-colors">
                    <div className="text-2xl mb-2">📐</div>
                    <h4 className="font-semibold text-sm">Геометрия</h4>
                    <p className="text-xs text-gray-500">8 задач</p>
                  </Card>
                  <Card className="p-4 border-2 border-gray-200 hover:border-[#8B5CF6] cursor-pointer transition-colors">
                    <div className="text-2xl mb-2">📈</div>
                    <h4 className="font-semibold text-sm">Графики</h4>
                    <p className="text-xs text-gray-500">15 задач</p>
                  </Card>
                  <Card className="p-4 border-2 border-gray-200 hover:border-[#8B5CF6] cursor-pointer transition-colors">
                    <div className="text-2xl mb-2">🎲</div>
                    <h4 className="font-semibold text-sm">Вероятность</h4>
                    <p className="text-xs text-gray-500">6 задач</p>
                  </Card>
                </div>
              </div>
            )}
          </Card>

          <div className="space-y-6">
            <Card className="bg-white/95 backdrop-blur border-white/20 shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Карта обучения</h2>
                <Icon name="Map" size={20} className="text-gray-400" />
              </div>
              
              <div className="space-y-4">
                {topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="group cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-sm group-hover:text-[#0EA5E9] transition-colors">
                          {topic.title}
                        </h3>
                        <p className="text-xs text-gray-500">{topic.subtopics} подтем</p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`${
                          topic.progress > 0 
                            ? 'bg-[#0EA5E9]/10 text-[#0EA5E9]' 
                            : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {topic.progress}%
                      </Badge>
                    </div>
                    <Progress 
                      value={topic.progress} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-[#8B5CF6] to-[#0EA5E9] border-0 shadow-xl p-6 text-white">
              <Icon name="Target" size={24} className="mb-3" />
              <h3 className="font-semibold mb-2">Цель недели</h3>
              <p className="text-sm text-white/90 mb-4">
                Пройди 5 новых тем и решай по 3 задачи ежедневно
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Прогресс</span>
                  <span className="font-semibold">3/5 тем</span>
                </div>
                <Progress value={60} className="h-2 bg-white/20" />
              </div>
            </Card>

            <Card className="bg-white/95 backdrop-blur border-white/20 shadow-xl p-6">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Icon name="BookOpen" size={18} />
                Быстрый доступ
              </h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                  <Icon name="History" size={14} className="mr-2" />
                  История чатов
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                  <Icon name="Bookmark" size={14} className="mr-2" />
                  Сохранённое
                </Button>
                <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                  <Icon name="FileText" size={14} className="mr-2" />
                  Конспекты
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
