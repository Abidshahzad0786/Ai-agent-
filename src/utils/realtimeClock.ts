const MONTHS_URDU: Record<number, string> = {
  0: 'January', 1: 'February', 2: 'March', 3: 'April',
  4: 'May', 5: 'June', 6: 'July', 7: 'August',
  8: 'September', 9: 'October', 10: 'November', 11: 'December'
};

const DAYS_URDU: Record<number, string> = {
  0: 'Sunday (Itwar / اتوار)',
  1: 'Monday (Peer / سوموار)',
  2: 'Tuesday (Mangal / منگل)',
  3: 'Wednesday (Budh / بدھ)',
  4: 'Thursday (Jumerat / جمعرات)',
  5: 'Friday (Juma / جمعہ المبارک)',
  6: 'Saturday (Hafta / ہفتہ)'
};

export function formatTime(date: Date): string {
  let hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const seconds = date.getUTCSeconds();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strMinutes = minutes < 10 ? '0' + minutes : minutes;
  const strHours = hours < 10 ? '0' + hours : hours;
  const strSeconds = seconds < 10 ? '0' + seconds : seconds;
  return `${strHours}:${strMinutes}:${strSeconds} ${ampm}`;
}

export function getCurrentLiveTimestampContext(): {
  year: number;
  dateStr: string;
  dayName: string;
  pktTime: string;
  dubaiTime: string;
  saudiTime: string;
  ukTime: string;
  usTime: string;
  summary: string;
} {
  const now = new Date();
  const pktDate = new Date(now.getTime() + 5 * 3600 * 1000);
  const dubaiDate = new Date(now.getTime() + 4 * 3600 * 1000);
  const saudiDate = new Date(now.getTime() + 3 * 3600 * 1000);
  const ukDate = new Date(now.getTime() + 1 * 3600 * 1000);
  const usEstDate = new Date(now.getTime() - 4 * 3600 * 1000);

  const monthName = MONTHS_URDU[pktDate.getUTCMonth()];
  const dayName = DAYS_URDU[pktDate.getUTCDay()];
  const year = pktDate.getUTCFullYear();
  const dateStr = `${pktDate.getUTCDate()} ${monthName} ${year}`;
  const pktTime = formatTime(pktDate);
  const dubaiTime = formatTime(dubaiDate);
  const saudiTime = formatTime(saudiDate);
  const ukTime = formatTime(ukDate);
  const usTime = formatTime(usEstDate);

  const summary = `Current Live Real-Time Context: Date: ${dateStr}, Day: ${dayName}, Year: ${year}. Live Pakistan Time (PKT UTC+5): ${pktTime}, UAE/Dubai: ${dubaiTime}, Saudi Arabia: ${saudiTime}, London/UK: ${ukTime}, USA/New York: ${usTime}.`;

  return {
    year,
    dateStr,
    dayName,
    pktTime,
    dubaiTime,
    saudiTime,
    ukTime,
    usTime,
    summary
  };
}

export function calculateRealTimeAnswer(text: string): string | null {
  const t = text.toLowerCase().trim();
  const timeKeywords = [
    'time', 'waqt', 'wakt', 'date', 'tareekh', 'tarikh', 'din', 'day',
    'saal', 'year', 'aj kia', 'aaj kya', 'abi kia', 'ab kya', 'konsa din',
    'current year', 'live time', 'taaza waqt', 'abhi ka time', 'today date',
    'clock', 'ghari', 'zone'
  ];

  const hasKeyword = timeKeywords.some(k => t.includes(k));
  const isImage = ['photo', 'pic', 'image', 'picture', 'tasweer', 'draw'].some(img => t.includes(img));

  if (hasKeyword && !isImage) {
    const live = getCurrentLiveTimestampContext();

    if (t.includes('dubai') || t.includes('uae') || t.includes('gulf')) {
      return `### 🇦🇪 Dubai & UAE Real-Time Update\n\n- **Live Time:** \`${live.dubaiTime}\` (GST, UTC+4)\n- **Date:** **${live.dateStr}**\n- **Day:** **${live.dayName}**\n- **Difference:** Pakistan se theek 1 ghanta peeche hai.`;
    }

    if (t.includes('america') || t.includes('usa') || t.includes('us') || t.includes('new york')) {
      return `### 🇺🇸 United States (New York / EDT) Real-Time Update\n\n- **Live Time:** \`${live.usTime}\` (EDT, UTC-4)\n- **Date:** **${live.dateStr}**\n- **Day:** **${live.dayName}**\n- **Difference:** Pakistan se 9 ghante peeche hai.`;
    }

    if (t.includes('saudi') || t.includes('makkah') || t.includes('madina')) {
      return `### 🇸🇦 Saudi Arabia (Makkah & Riyadh) Real-Time Update\n\n- **Live Time:** \`${live.saudiTime}\` (AST, UTC+3)\n- **Date:** **${live.dateStr}**\n- **Day:** **${live.dayName}**\n- **Difference:** Pakistan se 2 ghante peeche hai.`;
    }

    if (t.includes('london') || t.includes('uk') || t.includes('england')) {
      return `### 🇬🇧 United Kingdom (London / BST) Real-Time Update\n\n- **Live Time:** \`${live.ukTime}\` (BST, UTC+1)\n- **Date:** **${live.dateStr}**\n- **Day:** **${live.dayName}**\n- **Difference:** Pakistan se 4 ghante peeche hai.`;
    }

    // Comprehensive Live Clock Dashboard Card
    return `### 🕒 Real-Time Live Clock & Date Update\n\nYeh live real-time update hai bilkul accurate aur synchronized:\n\n| 🌍 Location / Region | ⏰ Live Time | 📅 Tareekh & Din |\n| :--- | :--- | :--- |\n| **🇵🇰 Pakistan (PKT - UTC+5)** | **\`${live.pktTime}\`** | **${live.dateStr}** (${live.dayName}) |\n| **🇦🇪 Dubai / UAE (GST - UTC+4)** | \`${live.dubaiTime}\` | ${live.dateStr} |\n| **🇸🇦 Saudi Arabia (AST - UTC+3)** | \`${live.saudiTime}\` | ${live.dateStr} |\n| **🇬🇧 London / UK (BST - UTC+1)** | \`${live.ukTime}\` | ${live.dateStr} |\n| **🇺🇸 New York / USA (EDT - UTC-4)** | \`${live.usTime}\` | ${live.dateStr} |\n\n> 💡 **Khulasa:** Aaj ka din **${live.dayName}** hai, tareekh **${live.dateStr}** hai, aur saal **${live.year}** chal raha hai.`;
  }

  return null;
}
