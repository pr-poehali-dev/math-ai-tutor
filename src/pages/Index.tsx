import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useToast } from '@/hooks/use-toast';

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

interface Achievement {
  code: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  earned: boolean;
}

interface UserData {
  level: number;
  xp: number;
  streak_days: number;
  next_level_xp: number;
}

const MATH_TUTOR_URL = 'https://functions.poehali.dev/9343dd9c-2f5a-466e-8e6a-1a3095cafd63';
const PROGRESS_URL = 'https://functions.poehali.dev/d85bed29-c9a8-49c8-8391-b9ee7fb12d80';

export default function Index() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Привет! Я твой AI-репетитор по математике. Задай мне вопрос или попроси решить задачу — я объясню всё пошагово! 📐'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'topics' | 'practice' | 'achievements'>('chat');
  const [userData, setUserData] = useState<UserData>({ level: 3, xp: 450, streak_days: 7, next_level_xp: 500 });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const topics: Topic[] = [
    { id: '1', title: 'Алгебра', progress: 65, subtopics: 12 },
    { id: '2', title: 'Геометрия', progress: 40, subtopics: 8 },
    { id: '3', title: 'Тригонометрия', progress: 25, subtopics: 6 },
    { id: '4', title: 'Математический анализ', progress: 10, subtopics: 15 },
    { id: '5', title: 'Теория вероятностей', progress: 0, subtopics: 7 },
    { id: '6', title: 'Линейная алгебра', progress: 0, subtopics: 10 }
  ];

  const progressData = [
    { day: 'Пн', xp: 20 },
    { day: 'Вт', xp: 45 },
    { day: 'Ср', xp: 30 },
    { day: 'Чт', xp: 60 },
    { day: 'Пт', xp: 50 },
    { day: 'Сб', xp: 80 },
    { day: 'Вс', xp: 70 }
  ];

  useEffect(() => {
    loadUserProgress();
  }, []);

  const loadUserProgress = async () => {
    try {
      const response = await fetch(`${PROGRESS_URL}?user_id=1`);
      const data = await response.json();
      
      if (data.user) {
        setUserData({
          level: data.user.level,
          xp: data.user.xp,
          streak_days: data.user.streak_days,
          next_level_xp: data.next_level_xp
        });
      }
      
      if (data.achievements) {
        setAchievements(data.achievements);
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const addXP = async (amount: number) => {
    try {
      const response = await fetch(PROGRESS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_xp',
          user_id: 1,
          xp: amount
        })
      });
      
      const data = await response.json();
      
      if (data.level_up) {
        setShowLevelUp(true);
        setTimeout(() => setShowLevelUp(false), 3000);
        toast({
          title: `🎉 Уровень ${data.level}!`,
          description: 'Поздравляю с новым уровнем!',
        });
      }
      
      setUserData(prev => ({
        ...prev,
        xp: data.xp,
        level: data.level,
        next_level_xp: data.level * 100
      }));
    } catch (error) {
      console.error('Failed to add XP:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(MATH_TUTOR_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 1,
          message: input
        })
      });

      const data = await response.json();
      const aiResponse = data.response || data.fallback_response || 'Произошла ошибка. Попробуй переформулировать вопрос.';
      
      const assistantMessage: Message = { 
        role: 'assistant', 
        content: aiResponse
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      await addXP(10);
      
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Не удалось получить ответ. Проверь подключение к интернету.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const getLevelTitle = (level: number) => {
    if (level < 3) return '🌱 Новичок';
    if (level < 5) return '📚 Ученик';
    if (level < 10) return '🎓 Студент';
    if (level < 15) return '🏆 Эксперт';
    return '👑 Мастер';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A1F2C] via-[#1A1F2C] to-[#0EA5E9]/10">
      {showLevelUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-gradient-to-br from-[#8B5CF6] to-[#0EA5E9] p-12 rounded-3xl text-center animate-scale-in">
            <Icon name="Trophy" size={64} className="text-white mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-white mb-2">Уровень {userData.level}!</h2>
            <p className="text-white/90 text-lg">{getLevelTitle(userData.level)}</p>
          </div>
        </div>
      )}

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
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20 px-4 py-2">
                <Icon name="Star" size={16} className="mr-2" />
                <div className="text-left">
                  <div className="text-xs opacity-60">Уровень</div>
                  <div className="font-bold">{userData.level}</div>
                </div>
              </Badge>
              <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                <Icon name="Flame" size={14} className="mr-1" />
                {userData.streak_days} дней
              </Badge>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>{userData.xp} / {userData.next_level_xp} XP</span>
              <span>{getLevelTitle(userData.level)}</span>
            </div>
            <Progress 
              value={(userData.xp / userData.next_level_xp) * 100} 
              className="h-3 bg-white/20"
            />
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
                <button
                  onClick={() => setActiveTab('achievements')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'achievements'
                      ? 'bg-white text-[#0EA5E9] border-b-2 border-[#0EA5E9]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon name="Award" size={16} className="inline mr-2" />
                  Достижения
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
                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !loading && handleSendMessage()}
                      placeholder="Введи свой вопрос или задачу..."
                      className="flex-1 border-gray-300 focus:border-[#0EA5E9]"
                      disabled={loading}
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] hover:opacity-90"
                      disabled={loading}
                    >
                      <Icon name="Send" size={18} />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Совет: Опиши задачу подробно, чтобы получить развёрнутое объяснение (+10 XP за вопрос)
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
                  <Button 
                    className="bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6]"
                    onClick={() => {
                      toast({
                        title: "🎯 Задача создана!",
                        description: "Реши уравнение: 3x + 7 = 22",
                      });
                      addXP(5);
                    }}
                  >
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

            {activeTab === 'achievements' && (
              <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Твои достижения</h3>
                <div className="grid grid-cols-1 gap-3">
                  {achievements.map((achievement) => (
                    <Card 
                      key={achievement.code}
                      className={`p-4 ${
                        achievement.earned 
                          ? 'bg-gradient-to-r from-[#8B5CF6]/10 to-[#0EA5E9]/10 border-[#0EA5E9]' 
                          : 'bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          achievement.earned ? 'bg-gradient-to-br from-[#8B5CF6] to-[#0EA5E9]' : 'bg-gray-300'
                        }`}>
                          <Icon name={achievement.icon as any} size={24} className="text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-semibold">{achievement.title}</h4>
                              <p className="text-sm text-gray-600">{achievement.description}</p>
                            </div>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              +{achievement.xp_reward} XP
                            </Badge>
                          </div>
                          {achievement.earned && (
                            <p className="text-xs text-green-600 mt-2">✅ Получено</p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <div className="space-y-6">
            <Card className="bg-white/95 backdrop-blur border-white/20 shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Прогресс за неделю</h2>
                <Icon name="TrendingUp" size={20} className="text-gray-400" />
              </div>
              
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6B7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="xp" 
                    stroke="#0EA5E9" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Card>

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
