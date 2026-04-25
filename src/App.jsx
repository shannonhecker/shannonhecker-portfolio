import { useState, useEffect, useCallback } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DEFAULT_ACTIVITIES = [
  { id: "sleep", emoji: "😴", label: "Good Sleep", color: "#7C6FF7" },
  { id: "bath", emoji: "🛁", label: "Good Bath", color: "#4ECDC4" },
  { id: "teeth", emoji: "🪥", label: "Brush Teeth", color: "#45B7D1" },
  { id: "school-book", emoji: "📖", label: "School Book", color: "#F7B731" },
  { id: "fun-book", emoji: "📚", label: "Fun Book", color: "#FC5C65" },
  { id: "mandarin", emoji: "🀄", label: "Mandarin", color: "#FF6348" },
  { id: "walk", emoji: "🚶", label: "Walk Outside", color: "#26DE81" },
  { id: "custom", emoji: "⭐", label: "Special!", color: "#FD9644", isCustom: true },
];

const THEMES = {
  football: {
    name: "Leo",
    avatar: "⚽",
    bgGradient: "linear-gradient(135deg, #E8F5E9 0%, #F1F8E9 40%, #FFFDE7 100%)",
    accent: "#4CAF50",
    accentLight: "#C8E6C9",
    accentDark: "#2E7D32",
    headerGradient: "linear-gradient(135deg, #4CAF50, #66BB6A, #43A047)",
    stickers: ["⚽", "🏆", "🥅", "🏅", "💪", "👟", "🎯", "🌟", "🔥", "⭐", "🏟️", "🦁", "💚", "✨", "🎉", "👑"],
    petStates: [
      { min: 0, max: 10, face: "🦁", mood: "Warming Up", bg: "#FFF8E1", msg: "Let's get training!" },
      { min: 11, max: 20, face: "🏃", mood: "In Training", bg: "#F1F8E9", msg: "Good effort!" },
      { min: 21, max: 35, face: "⚽", mood: "Match Ready", bg: "#E8F5E9", msg: "Playing great!" },
      { min: 36, max: 49, face: "🥅", mood: "Scoring Goals!", bg: "#E3F2FD", msg: "What a player!" },
      { min: 50, max: 56, face: "🏆", mood: "CHAMPION!", bg: "#FFF3E0", msg: "BALLON D'OR!" },
    ],
    badgeIcons: { diamond: "🏆", gold: "🥇", silver: "🥈", bronze: "🥉" },
    decorEmojis: ["⚽", "🥅", "👟"],
    streakIcon: "⚽",
    resetLabel: "🔄 Next Match",
  },
  dinosaur: {
    name: "Nathan",
    avatar: "🦕",
    bgGradient: "linear-gradient(135deg, #EDE7F6 0%, #E8EAF6 40%, #E1F5FE 100%)",
    accent: "#7E57C2",
    accentLight: "#D1C4E9",
    accentDark: "#4527A0",
    headerGradient: "linear-gradient(135deg, #7E57C2, #9575CD, #5C6BC0)",
    stickers: ["🦕", "🦖", "🌋", "🥚", "🦴", "🌿", "💎", "⭐", "🔥", "🌟", "🪨", "🌴", "💜", "✨", "🎉", "👑"],
    petStates: [
      { min: 0, max: 10, face: "🥚", mood: "Egg Stage", bg: "#F3E5F5", msg: "Almost hatching!" },
      { min: 11, max: 20, face: "🐣", mood: "Baby Dino", bg: "#EDE7F6", msg: "Rawr! Growing!" },
      { min: 21, max: 35, face: "🦕", mood: "Getting Big!", bg: "#E8EAF6", msg: "STOMP STOMP!" },
      { min: 36, max: 49, face: "🦖", mood: "T-REX Mode!", bg: "#E3F2FD", msg: "ROARRR!" },
      { min: 50, max: 56, face: "👑", mood: "DINO KING!", bg: "#FFF3E0", msg: "RULER OF ALL!" },
    ],
    badgeIcons: { diamond: "👑", gold: "🦖", silver: "🦕", bronze: "🥚" },
    decorEmojis: ["🦕", "🌋", "🦴"],
    streakIcon: "🦖",
    resetLabel: "🔄 Next Era",
  },
};

function getPetState(score, theme) {
  return theme.petStates.find((p) => score >= p.min && score <= p.max) || theme.petStates[0];
}

function getBadge(score, theme) {
  const bi = theme.badgeIcons;
  if (score >= 50) return { icon: bi.diamond, label: "Diamond", color: "#B388FF", glow: "#B388FF55" };
  if (score >= 40) return { icon: bi.gold, label: "Gold", color: "#FFD700", glow: "#FFD70055" };
  if (score >= 30) return { icon: bi.silver, label: "Silver", color: "#C0C0C0", glow: "#C0C0C055" };
  if (score >= 15) return { icon: bi.bronze, label: "Bronze", color: "#CD7F32", glow: "#CD7F3255" };
  return null;
}

function ConfettiEffect({ show, theme }) {
  if (!show) return null;
  const particles = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    color: ["#F7B731", "#FC5C65", "#45B7D1", "#26DE81", "#7C6FF7", "#FD9644", "#FF6348", "#4ECDC4"][i % 8],
    size: 5 + Math.random() * 10,
    rotation: Math.random() * 360,
    isEmoji: i % 5 === 0,
  }));
  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", zIndex: 9999 }}>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: "-10px",
            width: p.isEmoji ? "auto" : p.size,
            height: p.isEmoji ? "auto" : p.size,
            backgroundColor: p.isEmoji ? "transparent" : p.color,
            borderRadius: p.size > 10 ? "50%" : "2px",
            fontSize: p.isEmoji ? 20 : 0,
            transform: `rotate(${p.rotation}deg)`,
            animation: `confettiFall 2s ease-in ${p.delay}s forwards`,
          }}
        >
          {p.isEmoji ? theme.decorEmojis[p.id % theme.decorEmojis.length] : ""}
        </div>
      ))}
    </div>
  );
}

function StickerCheck({ checked, onClick, color, stickers }) {
  const [icon, setIcon] = useState(() => stickers[Math.floor(Math.random() * stickers.length)]);
  const [pop, setPop] = useState(false);
  const handleClick = () => {
    if (!checked) setIcon(stickers[Math.floor(Math.random() * stickers.length)]);
    setPop(true);
    setTimeout(() => setPop(false), 400);
    onClick();
  };
  return (
    <button
      type="button"
      onClick={handleClick}
      style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        border: `2.5px solid ${checked ? color : "#E8E8E8"}`,
        backgroundColor: checked ? `${color}18` : "transparent",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: pop ? "scale(1.35)" : checked ? "scale(1.1)" : "scale(1)",
        boxShadow: checked ? `0 3px 14px ${color}44` : "none",
        padding: 0,
      }}
    >
      <span
        style={{
          fontSize: checked ? 22 : 16,
          transition: "all 0.3s ease",
          filter: checked ? "none" : "grayscale(1) opacity(0.25)",
        }}
      >
        {checked ? icon : "○"}
      </span>
    </button>
  );
}

function VirtualPet({ score, name, theme }) {
  const pet = getPetState(score, theme);
  return (
    <div
      style={{
        background: pet.bg,
        borderRadius: 18,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        border: `2px solid ${theme.accentLight}`,
        transition: "background 0.5s ease",
      }}
    >
      <div
        style={{
          fontSize: 44,
          animation: score > 20 ? "petBounce 1.2s ease-in-out infinite" : "none",
        }}
      >
        {pet.face}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: theme.accent, marginBottom: 2 }}>{name}&apos;s Buddy</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#333" }}>{pet.mood}</div>
        <div style={{ fontSize: 12, color: "#999", fontWeight: 600, fontStyle: "italic" }}>&quot;{pet.msg}&quot;</div>
      </div>
    </div>
  );
}

function StreakCounter({ checks, theme }) {
  let streak = 0;
  for (let di = 0; di < DAYS.length; di++) {
    if (DEFAULT_ACTIVITIES.every((a) => checks[`${a.id}-${DAYS[di]}`])) streak++;
    else break;
  }
  const icons =
    streak >= 7
      ? `${theme.streakIcon}${theme.streakIcon}${theme.streakIcon}`
      : streak >= 4
        ? `${theme.streakIcon}${theme.streakIcon}`
        : streak >= 1
          ? theme.streakIcon
          : "💤";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: streak > 0 ? `linear-gradient(135deg, ${theme.accentLight}44, ${theme.accentLight})` : "#F5F5F5",
        borderRadius: 18,
        padding: "14px 18px",
        border: streak >= 4 ? `2px solid ${theme.accent}` : "2px solid rgba(0,0,0,0.04)",
      }}
    >
      <span style={{ fontSize: 26, animation: streak >= 4 ? "flamePulse 0.8s ease-in-out infinite" : "none" }}>{icons}</span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: streak > 0 ? theme.accentDark : "#BBB" }}>
          {streak > 0 ? `${streak}-day streak!` : "No streak yet"}
        </div>
        <div style={{ fontSize: 11, color: "#999", fontWeight: 600 }}>
          {streak >= 7 ? "PERFECT WEEK!" : streak > 0 ? "Keep it going!" : "Complete all tasks in a day"}
        </div>
      </div>
    </div>
  );
}

function RewardUnlock({ score, reward, onSetReward, theme }) {
  const [editing, setEditing] = useState(false);
  const [tempLabel, setTempLabel] = useState("");
  const [tempTarget, setTempTarget] = useState(40);
  const label = reward?.label;
  const target = reward?.target || 40;
  const progress = label ? Math.min(score / target, 1) : 0;
  const unlocked = label && score >= target;

  if (!label && !editing) {
    return (
      <button
        type="button"
        onClick={() => {
          setEditing(true);
          setTempLabel("");
          setTempTarget(40);
        }}
        style={{
          width: "100%",
          height: "100%",
          padding: "12px 16px",
          borderRadius: 18,
          border: `2px dashed ${theme.accentLight}`,
          background: "transparent",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 700,
          color: "#BBB",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}
      >
        🎁 Set a reward goal...
      </button>
    );
  }
  if (editing) {
    return (
      <div
        style={{
          background: "white",
          borderRadius: 18,
          padding: 16,
          border: `2px solid ${theme.accent}`,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800, color: theme.accent }}>🎁 Set Reward</div>
        <input
          autoFocus
          value={tempLabel}
          onChange={(e) => setTempLabel(e.target.value)}
          placeholder="e.g. Ice cream trip!"
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "2px solid #E8E8E8",
            fontSize: 14,
            fontWeight: 600,
            fontFamily: "inherit",
            outline: "none",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#666" }}>Stars:</span>
          <input
            type="range"
            min={10}
            max={56}
            value={tempTarget}
            onChange={(e) => setTempTarget(Number(e.target.value))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: 14, fontWeight: 800, color: theme.accent, minWidth: 28 }}>{tempTarget}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            type="button"
            onClick={() => setEditing(false)}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: 10,
              border: "2px solid #E8E8E8",
              background: "white",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 13,
              fontFamily: "inherit",
              color: "#999",
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              if (tempLabel.trim()) {
                onSetReward({ label: tempLabel.trim(), target: tempTarget });
                setEditing(false);
              }
            }}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: 10,
              border: "none",
              background: theme.accent,
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 13,
              fontFamily: "inherit",
              color: "white",
            }}
          >
            Save 🎉
          </button>
        </div>
      </div>
    );
  }
  return (
    <div
      style={{
        background: unlocked ? "linear-gradient(135deg, #E8F5E9, #F1F8E9)" : "white",
        borderRadius: 18,
        padding: "14px 18px",
        border: unlocked ? "2px solid #66BB6A" : "2px solid rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 20, animation: unlocked ? "rewardWiggle 0.6s ease-in-out infinite" : "none" }}>🎁</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: unlocked ? "#2E7D32" : "#555" }}>{label}</span>
        </div>
        <button
          type="button"
          onClick={() => onSetReward(null)}
          style={{
            background: "none",
            border: "none",
            fontSize: 16,
            cursor: "pointer",
            color: "#CCC",
            padding: "0 4px",
          }}
        >
          ×
        </button>
      </div>
      <div style={{ height: 10, borderRadius: 5, background: "#F0F0F0", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            borderRadius: 5,
            background: unlocked
              ? "linear-gradient(90deg, #66BB6A, #26DE81)"
              : `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
            width: `${progress * 100}%`,
            transition: "width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#999", marginTop: 6, textAlign: "right" }}>
        {unlocked ? "🎊 UNLOCKED!" : `${score}/${target} stars`}
      </div>
    </div>
  );
}

function BadgeShelf({ badges, currentBadge, theme }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      {badges.map((b, i) => (
        <div
          key={i}
          title={`Week ${i + 1}: ${b.label}`}
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: `${b.color}22`,
            border: `2px solid ${b.color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            boxShadow: `0 2px 6px ${b.glow}`,
          }}
        >
          {b.icon}
        </div>
      ))}
      {currentBadge && (
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: `${currentBadge.color}22`,
            border: `2.5px dashed ${currentBadge.color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            animation: "badgePulse 1.5s ease-in-out infinite",
            boxShadow: `0 2px 10px ${currentBadge.glow}`,
          }}
        >
          {currentBadge.icon}
        </div>
      )}
      {!currentBadge && badges.length === 0 && (
        <span style={{ fontSize: 12, color: "#CCC", fontWeight: 600 }}>Earn 15+ stars for a badge!</span>
      )}
    </div>
  );
}

function WeeklyHistory({ history, theme }) {
  if (history.length === 0) return null;
  return (
    <div
      style={{
        background: "white",
        borderRadius: 18,
        padding: "14px 18px",
        border: "2px solid rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 800, color: "#888", marginBottom: 10 }}>📊 Past Weeks</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 90, paddingBottom: 22 }}>
        {history.slice(-8).map((h, i) => {
          const pct = h.score / 56;
          const badge = getBadge(h.score, theme);
          return (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1 }}>
              {badge && <span style={{ fontSize: 12 }}>{badge.icon}</span>}
              <span style={{ fontSize: 10, fontWeight: 700, color: "#999" }}>{h.score}</span>
              <div
                style={{
                  width: "100%",
                  maxWidth: 36,
                  height: `${Math.max(pct * 55, 4)}px`,
                  borderRadius: 6,
                  background: badge
                    ? `linear-gradient(180deg, ${badge.color}, ${badge.color}88)`
                    : `linear-gradient(180deg, ${theme.accentLight}, #EEE)`,
                }}
              />
              <span style={{ fontSize: 9, fontWeight: 700, color: "#CCC" }}>W{i + 1}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChildTracker({ themeKey, onScoreChange }) {
  const theme = THEMES[themeKey];
  const initChecks = () => {
    const s = {};
    DEFAULT_ACTIVITIES.forEach((a) => DAYS.forEach((d) => (s[`${a.id}-${d}`] = false)));
    return s;
  };
  const [checks, setChecks] = useState(initChecks);
  const [customLabel, setCustomLabel] = useState("");
  const [editingCustom, setEditingCustom] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [childName, setChildName] = useState(theme.name);
  const [editingName, setEditingName] = useState(false);
  const [badges, setBadges] = useState([]);
  const [weekHistory, setWeekHistory] = useState([]);
  const [reward, setReward] = useState(null);

  const totalChecked = Object.values(checks).filter(Boolean).length;
  const maxTotal = DEFAULT_ACTIVITIES.length * DAYS.length;
  const currentBadge = getBadge(totalChecked, theme);

  useEffect(() => {
    onScoreChange(totalChecked);
  }, [totalChecked, onScoreChange]);

  const toggle = (key) => {
    setChecks((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!prev[key] && Object.values(next).filter(Boolean).length === maxTotal) setShowConfetti(true);
      return next;
    });
  };

  useEffect(() => {
    if (showConfetti) {
      const t = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(t);
    }
  }, [showConfetti]);

  const getRowTotal = (actId) => DAYS.reduce((s, d) => s + (checks[`${actId}-${d}`] ? 1 : 0), 0);

  const reset = () => {
    if (window.confirm(`Save ${childName}'s progress and start a new week?`)) {
      const badge = getBadge(totalChecked, theme);
      if (badge) setBadges((prev) => [...prev, badge]);
      setWeekHistory((prev) => [...prev, { score: totalChecked }]);
      setChecks(initChecks());
      setCustomLabel("");
      setShowConfetti(true);
    }
  };

  return (
    <div
      style={{
        background: theme.bgGradient,
        borderRadius: 24,
        padding: "20px 16px 24px",
        boxShadow: "0 4px 28px rgba(0,0,0,0.06)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <ConfettiEffect show={showConfetti} theme={theme} />

      <div
        style={{
          position: "absolute",
          top: 12,
          right: 16,
          fontSize: 40,
          opacity: 0.08,
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        {theme.decorEmojis.join(" ")}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: theme.headerGradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 26,
              boxShadow: `0 3px 12px ${theme.accent}44`,
            }}
          >
            {theme.avatar}
          </div>
          {editingName ? (
            <input
              autoFocus
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
              style={{
                fontSize: 22,
                fontWeight: 800,
                border: "none",
                borderBottom: `2px dashed ${theme.accent}`,
                background: "transparent",
                outline: "none",
                width: 140,
                fontFamily: "inherit",
                color: "#333",
              }}
            />
          ) : (
            <h2
              onClick={() => setEditingName(true)}
              style={{ fontSize: 22, fontWeight: 800, color: "#333", margin: 0, cursor: "pointer" }}
              title="Click to rename"
            >
              {childName}
            </h2>
          )}
        </div>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: "8px 16px",
            borderRadius: 12,
            border: `2px solid ${theme.accentLight}`,
            background: "white",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            color: theme.accent,
            fontFamily: "inherit",
            transition: "all 0.2s ease",
          }}
        >
          {theme.resetLabel}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <VirtualPet score={totalChecked} name={childName} theme={theme} />
        <StreakCounter checks={checks} theme={theme} />
      </div>

      <div
        style={{
          background: "white",
          borderRadius: 14,
          padding: "10px 16px",
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          gap: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <span style={{ fontSize: 20 }}>{theme.avatar}</span>
        <div style={{ flex: 1 }}>
          <div style={{ height: 14, borderRadius: 7, background: "#F0F0F0", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                borderRadius: 7,
                background:
                  totalChecked === maxTotal
                    ? `linear-gradient(90deg, ${theme.accent}, #F7B731, #FC5C65, ${theme.accent})`
                    : `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                width: `${(totalChecked / maxTotal) * 100}%`,
                transition: "width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            />
          </div>
        </div>
        <span style={{ fontWeight: 800, fontSize: 18, color: "#333", minWidth: 60, textAlign: "right" }}>
          {totalChecked}/{maxTotal}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div style={{ background: "white", borderRadius: 18, padding: "12px 14px", border: "2px solid rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: theme.accent, marginBottom: 8 }}>🏅 Badge Shelf</div>
          <BadgeShelf badges={badges} currentBadge={currentBadge} theme={theme} />
        </div>
        <RewardUnlock score={totalChecked} reward={reward} onSetReward={setReward} theme={theme} />
      </div>

      {weekHistory.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <WeeklyHistory history={weekHistory} theme={theme} />
        </div>
      )}

      <div style={{ overflowX: "auto", borderRadius: 16 }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "separate",
            borderSpacing: 0,
            background: "rgba(255,255,255,0.75)",
            borderRadius: 16,
            overflow: "hidden",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: "10px 12px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#999",
                  borderBottom: `2px solid ${theme.accentLight}66`,
                  position: "sticky",
                  left: 0,
                  background: "rgba(255,255,255,0.97)",
                  zIndex: 2,
                  minWidth: 130,
                }}
              >
                Activity
              </th>
              {DAYS.map((d) => (
                <th
                  key={d}
                  style={{
                    padding: "10px 6px",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#999",
                    textAlign: "center",
                    borderBottom: `2px solid ${theme.accentLight}66`,
                    minWidth: 50,
                  }}
                >
                  {d}
                </th>
              ))}
              <th
                style={{
                  padding: "10px 12px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: theme.accent,
                  textAlign: "center",
                  borderBottom: `2px solid ${theme.accentLight}66`,
                  minWidth: 55,
                }}
              >
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {DEFAULT_ACTIVITIES.map((act, ri) => {
              const rowTotal = getRowTotal(act.id);
              const isComplete = rowTotal === 7;
              return (
                <tr key={act.id} style={{ background: ri % 2 === 0 ? "transparent" : `${theme.accentLight}15` }}>
                  <td
                    style={{
                      padding: "8px 12px",
                      position: "sticky",
                      left: 0,
                      background: ri % 2 === 0 ? "rgba(255,255,255,0.97)" : "rgba(248,248,248,0.97)",
                      zIndex: 1,
                      borderBottom: "1px solid #F5F5F5",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 22 }}>{act.emoji}</span>
                      {act.isCustom && editingCustom ? (
                        <input
                          autoFocus
                          value={customLabel}
                          placeholder="Type here..."
                          onChange={(e) => setCustomLabel(e.target.value)}
                          onBlur={() => setEditingCustom(false)}
                          onKeyDown={(e) => e.key === "Enter" && setEditingCustom(false)}
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            border: "none",
                            borderBottom: `2px dashed ${act.color}`,
                            background: "transparent",
                            outline: "none",
                            width: 90,
                            fontFamily: "inherit",
                            color: "#333",
                          }}
                        />
                      ) : (
                        <span
                          onClick={act.isCustom ? () => setEditingCustom(true) : undefined}
                          style={{
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#444",
                            cursor: act.isCustom ? "pointer" : "default",
                            borderBottom: act.isCustom ? `2px dashed ${act.color}44` : "none",
                          }}
                        >
                          {act.isCustom && customLabel ? customLabel : act.label}
                        </span>
                      )}
                    </div>
                  </td>
                  {DAYS.map((d) => (
                    <td key={d} style={{ textAlign: "center", padding: "6px 2px", borderBottom: "1px solid #F5F5F5" }}>
                      <StickerCheck
                        checked={checks[`${act.id}-${d}`]}
                        onClick={() => toggle(`${act.id}-${d}`)}
                        color={act.color}
                        stickers={theme.stickers}
                      />
                    </td>
                  ))}
                  <td
                    style={{
                      textAlign: "center",
                      padding: "6px 12px",
                      borderBottom: "1px solid #F5F5F5",
                      fontWeight: 800,
                      fontSize: 18,
                      color: isComplete ? "#26DE81" : "#999",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {rowTotal}/7
                      {isComplete && (
                        <span style={{ fontSize: 16, animation: "rewardWiggle 1s ease-in-out infinite" }}>🎉</span>
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function App() {
  const [scores, setScores] = useState({ football: 0, dinosaur: 0 });
  const [activeTab, setActiveTab] = useState("football");
  const handleFootballScore = useCallback((score) => {
    setScores((prev) => (prev.football === score ? prev : { ...prev, football: score }));
  }, []);
  const handleDinosaurScore = useCallback((score) => {
    setScores((prev) => (prev.dinosaur === score ? prev : { ...prev, dinosaur: score }));
  }, []);

  const tabs = [
    { key: "football", theme: THEMES.football, onScoreChange: handleFootballScore },
    { key: "dinosaur", theme: THEMES.dinosaur, onScoreChange: handleDinosaurScore },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        fontFamily: "'Nunito', 'Fredoka', -apple-system, sans-serif",
        padding: "16px 12px 40px",
        background: "linear-gradient(180deg, #FAFBFF 0%, #F5F0FF 100%)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&family=Nunito:wght@600;700;800;900&display=swap');
        @keyframes confettiFall { 0%{transform:translateY(0) rotate(0deg);opacity:1} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }
        @keyframes petBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes flamePulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.2)} }
        @keyframes badgePulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.1);opacity:0.8} }
        @keyframes rewardWiggle { 0%,100%{transform:rotate(0deg)} 25%{transform:rotate(-8deg)} 75%{transform:rotate(8deg)} }
        *{box-sizing:border-box} body{margin:0}
        table{font-family:'Nunito',sans-serif}
        ::-webkit-scrollbar{height:6px} ::-webkit-scrollbar-thumb{background:#DDD;border-radius:3px}
        input[type="range"]{-webkit-appearance:none;height:6px;border-radius:3px;background:#E8E8E8;outline:none}
        input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#7C6FF7;cursor:pointer;border:2px solid white;box-shadow:0 2px 6px rgba(124,111,247,0.3)}
      `}</style>

      <div style={{ textAlign: "center", marginBottom: 18, padding: "8px 0" }}>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 900,
            margin: 0,
            fontFamily: "'Fredoka', sans-serif",
            background: "linear-gradient(135deg, #4CAF50, #7E57C2, #F7B731)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          ⭐ Weekly Superstar Tracker ⭐
        </h1>
        <p style={{ color: "#AAA", fontSize: 13, margin: "4px 0 0", fontWeight: 600 }}>
          Collect stickers every day — how many can you get?
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 18 }}>
        {tabs.map(({ key, theme }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            style={{
              padding: "10px 22px",
              borderRadius: 14,
              border: activeTab === key ? `2.5px solid ${theme.accent}` : "2.5px solid #E8E8E8",
              background: activeTab === key ? "white" : "transparent",
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
              color: activeTab === key ? "#333" : "#AAA",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: activeTab === key ? `0 2px 12px ${theme.accent}25` : "none",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            <span style={{ fontSize: 20 }}>{theme.avatar}</span>
            {theme.name}
            <span
              style={{
                background: activeTab === key ? theme.accent : "#E0E0E0",
                color: "white",
                borderRadius: 8,
                padding: "2px 8px",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {scores[key]}
            </span>
          </button>
        ))}
      </div>

      {tabs.map(({ key, onScoreChange }) => (
        <div key={key} style={{ display: activeTab === key ? "block" : "none", maxWidth: 860, margin: "0 auto" }}>
          <ChildTracker themeKey={key} onScoreChange={onScoreChange} />
        </div>
      ))}

      <p style={{ textAlign: "center", color: "#CCC", fontSize: 11, marginTop: 24, fontWeight: 600 }}>
        {
          '💡 Tap names to rename · Tap "Special!" to customise · Set a reward goal · Hit "New Week" to save & reset'
        }
      </p>
    </div>
  );
}
