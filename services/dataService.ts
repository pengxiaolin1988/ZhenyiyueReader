
import { Book, Review, User, Chapter, Highlight, Question } from '../types';

const STORAGE_KEYS = {
  LIBRARY: 'lumina_library_v2', 
  INVENTORY: 'lumina_store_inventory_v1',
  REVIEWS: 'lumina_reviews_v1',
  USERS: 'lumina_users_v2',
  QUESTIONS: 'lumina_questions_v1',
  READING_STATS: 'lumina_reading_stats_v1', 
};

// 辅助函数：生成真正具有排版感且足够长的段落
const getThreeBodyContent = (chapterIdx: number) => {
  const baseTexts = [
    // 章节 1
    [
      "那是一个疯狂的年代。汪淼觉得，他正陷入一个超自然的旋涡中。这个旋涡的中心就是申玉菲，那个冷艳得像冰块一样的女人。申玉菲曾是科学边界的成员，而现在，科学边界似乎成了某种宗教的代名词。最近，接连有物理学家自杀，每一个人的遗言都指向同一个令人绝望的结论：物理学不存在了。",
      "汪淼走在清华大学的校园里，阳光刺眼，但他感到一阵彻骨的寒意。他看到眼前的世界似乎在颤抖，倒计时的红字在虚空中闪烁。那不是幻觉，因为当他闭上眼，那些数字依然存在。幽灵倒计时，这是它给他的名字。",
      "他去找了丁仪，那个因为发现超弦理论而声名鹊起的物理学家。丁仪正颓废地坐在沙发上，面前摆着一个台球桌。丁仪说：汪淼，你看这球。如果我在不同的地方打，球的轨迹是一样的。这是空间均匀性。但如果有一天，球在不同的地方乱飞，不再遵循任何规律，你觉得物理学还存在吗？",
      "这就是现在发生的事。微观世界的规律崩塌了。所有的粒子加速器给出的实验结果都是一团乱麻。这就像是一个顽皮的孩子在拨弄地球的琴弦，而我们这些自诩聪明的蚂蚁，却试图总结琴弦震动的规律。",
      "汪淼想起了申玉菲给他的建议：停止研究。只要停止他的纳米材料研究，倒计时就会消失。这是某种威胁，还是某种来自更高维度的警告？他不知道。他只知道，作为一名科学家，承认物理学不存在，比死亡更痛苦。",
      "夜晚的北京笼罩在雾霾中，霓虹灯变得模糊不清。汪淼坐在车里，看着窗外川流不息的人群。这些人生活在无知中，这种无知在这一刻显得如此幸福。他想告诉他们，世界的基础已经动摇，但谁会相信一个纳米研究员的梦呓呢？"
    ],
    // 章节 2
    [
      "叶文洁站在红岸基地的雷达天线前，寒风凛例。大兴安岭的冬天漫长而死寂。这里是国家的最高机密，任务是寻找外星文明，或者是防御外星文明。但在这里工作的人都知道，这只是一个耗费巨大的幻梦。宇宙太大了，我们就像在黑暗中划亮火柴的孩子。",
      "然而，叶文洁发现了一个秘密。太阳。太阳不是一个简单的发光体，它是一个巨大的信号放大器。如果信号以特定的频率射向太阳，它会被增强并向全宇宙扩散。她瞒过了所有人，利用这个“太阳天线”，向宇宙发出了一条信息。",
      "那是一条极其简单的信息，包含了人类的坐标和基本的文明描述。她并没有抱太大希望，直到那个深夜。屏幕上出现了一串规律的代码。那是回信。来自半人马座阿尔法星的回信。",
      "回信的内容只有一句话，重复了三次：不要回答！不要回答！！不要回答！！！那个未知的文明警告她，如果回答，她的坐标将被定位，她的世界将被入侵。叶文洁看着窗外的星空，眼中闪过一丝决绝。",
      "她按下了发射键。她的回答是：到这里来吧，我将帮助你们获得这个世界。我的文明已无力解决自己的问题，我们需要你们的力量来介入。这一刻，人类的命运被永远改写了。",
      "天线在寒风中缓缓转动，发出刺耳的摩擦声。叶文洁感到一种前所未有的宁静。她终于复仇了，不仅是为了自己，也是为了她那个被狂热毁灭的家庭。"
    ],
    // 章节 3
    [
      "汪淼再次戴上V装具，进入了名为《三体》的虚拟世界。这一次，他身处一片荒凉的平原，远处有三颗巨大的火球在无规律地运行。这里有秦始皇，有墨子，有哥白尼。他们都在试图寻找恒纪元和乱纪元的规律。",
      "“脱水！”远处传来一声凄厉的叫喊。随着三颗太阳同时出现在地平线上，大地的水分瞬间蒸发。人类为了生存，必须将自己脱水，变成一张张薄薄的人皮，储存在黑暗的仓库里，等待下一次恒纪元的到来。",
      "在这个世界里，文明毁灭了无数次，又重生了无数次。每一次重生的文明都比上一次更先进，但每一次在绝对的宇宙灾难面前都显得如此渺小。这不只是一个游戏，汪淼意识到，这是某个文明真实历史的缩影。",
      "乱纪元的无规律性是这个世界的本质。三体问题，在数学上是无解的。这个文明唯一的希望，就是离开这颗随时会被三颗太阳撕裂的行星，寻找一个新的家园。而那个家园，就是叶文洁指引的方向。",
      "汪淼看着秦始皇用数百万士兵组成的“人列计算机”，试图计算天体运行的轨迹。那一面面旗帜挥舞间，是文明最后的挣扎。然而，当三连星出现，一切计算都失去了意义。火海吞噬了平原。",
      "巨浪般的火焰席卷大地，汪淼感到一种真实的灼热。这不仅是数据的模拟，这是宇宙的暴力在视网膜上的投影。"
    ],
    // 章节 4, 5, 6 同理增加深度...
    [
        "整个宇宙背景辐射在汪淼的视网膜上跳动。这一刻，他感到了某种神性的存在，或者说，是高等文明对低等文明随意的嘲弄。",
        "物理规律是宇宙的契约。当契约被单方面撕毁，我们所处的世界就变成了一座没有围墙的疯人院。",
        "常伟思少将看着数据，沉默了许久。他知道，这不再是演习。这是一场降维打击，而人类甚至还不知道对手是谁。",
        "“智子”，这个名字听起来如此轻盈，却沉重得压垮了整个人类文明的未来。"
    ],
    [
        "巴拿马运河，审判日号。汪淼研制的“飞刃”丝线横跨河道。这是一场寂静的屠杀。",
        "船体像黄油一样断裂开来。没有任何声音，只有金属切开金属的微弱震动。数据被抢救出来了，那是魔鬼的日记。",
        "伊文斯在临死前看着窗外。他一直以为自己是拯救者，其实他只是毁灭的引路人。"
    ],
    [
        "史强蹲在麦田边，看着漫天的蝗虫。他吐出一口烟圈，说：看，这就是虫子。人类用尽了一切办法，它们灭绝了吗？",
        "丁仪和汪淼坐在泥地上，看着那些顽强的生命。在三体人眼里，我们是虫子。但在虫子眼里，我们也是神。",
        "宇宙是黑暗森林。每一个文明都是带枪的猎人。这一刻，人类终于明白了森林法则。"
    ]
  ];
  
  const content = baseTexts[chapterIdx] || baseTexts[0];
  // 每一章内容重复 3 遍，确保有足够的字数支持左右翻页测试
  const fullParagraphs = [...content, ...content, ...content];
  
  return fullParagraphs.map(p => `<p class="mb-6 indent-8 text-justify leading-relaxed">${p}</p>`).join('');
};

const INITIAL_BOOKS: Book[] = [
  {
    id: 'b1', title: '三体', author: '刘慈欣', genre: '科幻', rating: 4.9, progress: 35,
    coverUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&w=400&q=80',
    description: '文化大革命时期，红岸基地向宇宙发出了第一条信息，改变了人类的命运...',
    chapters: [
      { id: 'c1', title: '第一章 科学边界', content: getThreeBodyContent(0) },
      { id: 'c2', title: '第二章 红岸基地', content: getThreeBodyContent(1) },
      { id: 'c3', title: '第三章 三体游戏', content: getThreeBodyContent(2) },
      { id: 'c4', title: '第四章 宇宙闪烁', content: getThreeBodyContent(3) },
      { id: 'c5', title: '第五章 古筝行动', content: getThreeBodyContent(4) },
      { id: 'c6', title: '第六章 虫子', content: getThreeBodyContent(5) }
    ]
  },
  {
    id: 'b2', title: '人类简史', author: '尤瓦尔·赫拉利', genre: '历史', rating: 4.8, progress: 12,
    coverUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=400&q=80',
    description: '从认知革命、农业革命到科学革命，重新审视人类历史的进程。',
    chapters: [
      { id: 'c1', title: '认知革命', content: '<p>人类之所以能统治地球，是因为我们能够相信虚构的故事。</p>' }
    ]
  }
];

class DataService {
  constructor() { this.init(); }

  private init() {
    // Only seed if empty to persist changes
    if (!localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
      localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(INITIAL_BOOKS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.LIBRARY)) {
      localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(INITIAL_BOOKS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([
          { id: 'u_curr', username: 'admin', nickname: '阅读者一号', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200', bio: '终身学习者。', following: 128, followers: 42, fans: 1205 }
      ]));
    }
  }

  async getBookById(id: string): Promise<Book | null> {
    const inventory = JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY) || '[]');
    return inventory.find((b: any) => b.id === id) || null;
  }
  async getMyBooks(): Promise<Book[]> {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.LIBRARY) || '[]');
  }
  async getCurrentUser(): Promise<User> {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    return users[0];
  }
  async getReadingHistory(): Promise<Record<string, number>> { return {}; }
  async getTodayReadingMinutes(): Promise<number> { return 15; }
  async getStoreData() { 
    const inventory = await this.getAllStoreBooks();
    return { heroes: inventory, topCharts: inventory, newReleases: inventory }; 
  }
  async getAllStoreBooks(): Promise<Book[]> { 
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.INVENTORY) || '[]'); 
  }
  async isInLibrary(id: string): Promise<boolean> { 
    const lib = await this.getMyBooks();
    return lib.some(b => b.id === id); 
  }
  // Added missing toggleLibrary method
  async toggleLibrary(book: Book): Promise<boolean> {
    const lib = await this.getMyBooks();
    const idx = lib.findIndex(b => b.id === book.id);
    let newState = false;
    if (idx !== -1) {
      lib.splice(idx, 1);
      newState = false;
    } else {
      lib.push(book);
      newState = true;
    }
    localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(lib));
    return newState;
  }
  async getReviews(id: string) { return []; }
  async saveHighlight(bookId: string, h: Highlight) {}
  async getAllHighlights() { return []; }
  async getUserStats() { return { booksCount: 2, readingHours: 10, notesCount: 5 }; }

  // Added missing getUsers method
  async getUsers(): Promise<User[]> {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  }
  // Added missing saveUser method
  async saveUser(user: User): Promise<void> {
    const users = await this.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx !== -1) users[idx] = user;
    else users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }
  // Added missing saveBook method
  async saveBook(book: Book): Promise<void> {
    const inv = await this.getAllStoreBooks();
    const idx = inv.findIndex(b => b.id === book.id);
    if (idx !== -1) inv[idx] = book;
    else inv.push(book);
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inv));
    
    // Also update library entry if it exists there
    const lib = await this.getMyBooks();
    const libIdx = lib.findIndex(b => b.id === book.id);
    if (libIdx !== -1) {
      lib[libIdx] = { ...lib[libIdx], ...book };
      localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(lib));
    }
  }
  // Added missing deleteBook method
  async deleteBook(id: string): Promise<void> {
    const inv = await this.getAllStoreBooks();
    const newInv = inv.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(newInv));
    
    const lib = await this.getMyBooks();
    const newLib = lib.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.LIBRARY, JSON.stringify(newLib));
  }
}

export const dataService = new DataService();
