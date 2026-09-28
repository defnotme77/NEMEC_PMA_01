import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  SafeAreaView,
  Platform,
  StatusBar as RNStatusBar,
  Modal,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import Svg, { Path, Rect, Circle, Ellipse, G } from "react-native-svg";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg: "#0E1510",
  surface: "#131813",
  surfaceC: "#1D251E",
  surfaceCH: "#27312A",
  surfaceCHi: "#323E34",
  primary: "#7DD987",
  onPrimary: "#003910",
  priContainer: "#1B4F22",
  onPriC: "#9DF6A5",
  error: "#FFB4AB",
  errorC: "#4E1010",
  outline: "#4E6B52",
  outlineVar: "#2E4533",
  fg: "#E2F0E3",
  fgMuted: "#A0C9A7",
  fgDim: "#6B9172",
};

// ─── Types & Defaults ─────────────────────────────────────────────────────────
const DEFAULT_PROVIDERS = {
  ChatGPT: { liters: 21.4, tokens: 850000 },
  Claude: { liters: 14.2, tokens: 470000 },
  Gemini: { liters: 7.2, tokens: 360000 },
};

const modelOpts = {
  ChatGPT: ["GPT-4o", "GPT-4o mini", "GPT-4 Turbo", "GPT-3.5 Turbo"],
  Claude: [
    "Claude 3.5 Sonnet",
    "Claude 3 Opus",
    "Claude 3 Haiku",
    "Claude 3.5 Haiku",
  ],
  Gemini: [
    "Gemini 1.5 Pro",
    "Gemini 1.5 Flash",
    "Gemini 1.0 Pro",
    "Gemini 2.0 Flash",
  ],
};

const rates = { ChatGPT: 25, Claude: 30, Gemini: 20 };

const SHOWER_L = 65;
const QUIPS = [
  "Try washing everything except your left elbow — that should cover it.",
  "Your coworkers will file a formal complaint around month 3.",
  "Scientists recommend starting with the kneecaps. Lower priority area.",
  "At this rate your houseplants are judging you.",
  "Roughly one armpit per week. Choose wisely.",
  "The planet says thanks. Your friends say otherwise.",
  "You'll save water and make everyone around you question their life choices.",
];

function showerQuip(liters) {
  const monthly = Math.round((liters / SHOWER_L) * 10) / 10;
  const yearly = Math.round(((liters * 12) / SHOWER_L) * 10) / 10;
  const joke = QUIPS[Math.floor(liters * 10) % QUIPS.length];
  return { monthly, yearly, joke };
}

const EMOJI_PALETTE = [
  "🤖",
  "🧠",
  "✨",
  "⚡",
  "🔮",
  "🌀",
  "🎯",
  "🚀",
  "🦾",
  "💡",
  "🔬",
  "🌊",
  "🐙",
  "🦄",
  "🔥",
  "🍃",
  "🌿",
  "🌱",
  "💎",
  "🎪",
  "🐋",
  "🦋",
  "🌸",
  "🍄",
];
const BG_PALETTE = [
  "#1B4F22",
  "#1A3C44",
  "#3B1F44",
  "#44291A",
  "#1A2444",
  "#441A1A",
  "#2A3B1A",
  "#1A3A3A",
];

const API_COMMANDS = [
  {
    title: "OpenAI — Monthly usage",
    icon: "🟢",
    description: "Fetch token usage for the current month via the OpenAI API",
    code: `curl "https://api.openai.com/v1/usage?date=$(date +%Y-%m-%d)" \\
  -H "Authorization: Bearer $OPENAI_API_KEY" | \\
  python3 -c "import sys,json; d=json.load(sys.stdin); print(sum(x.get('n_context_tokens_total',0)+x.get('n_generated_tokens_total',0) for x in d.get('data',[])))"`,
  },
  {
    title: "Anthropic — Token tracking system prompt",
    icon: "🟤",
    description:
      "Paste this into your agent's system prompt to get live token counts",
    code: `After every response, append a line in this exact format:
[HydroPrompt] input_tokens: {YOUR_INPUT_TOKEN_COUNT} output_tokens: {YOUR_OUTPUT_TOKEN_COUNT}

Use the actual values from your API response metadata (usage.input_tokens, usage.output_tokens). This line is parsed by HydroPrompt for water footprint tracking.`,
  },
  {
    title: "Gemini — Usage metadata extraction",
    icon: "🔵",
    description: "Extract token counts from a Gemini API response in Python",
    code: `import google.generativeai as genai, os
genai.configure(api_key=os.environ["GEMINI_API_KEY"])
model = genai.GenerativeModel("gemini-1.5-pro")
resp  = model.generate_content("Your prompt here")
meta  = resp.usage_metadata
print(f"input:  {meta.prompt_token_count} tokens")
print(f"output: {meta.candidates_token_count} tokens")
print(f"total:  {meta.total_token_count} tokens")`,
  },
  {
    title: "Universal — Any OpenAI-compatible API",
    icon: "🌐",
    description:
      "Works with any OpenAI-compatible endpoint (Ollama, Groq, Together, etc.)",
    code: `# After your API call, extract from the response:
# response.usage.prompt_tokens     → input tokens
# response.usage.completion_tokens → output tokens
# response.usage.total_tokens      → total

from openai import OpenAI
client = OpenAI(base_url="YOUR_BASE_URL", api_key="YOUR_KEY")
r = client.chat.completions.create(model="MODEL", messages=[...])
print(f"[HydroPrompt] input: {r.usage.prompt_tokens} output: {r.usage.completion_tokens}")`,
  },
];

// ─── Original Vector Icons ───────────────────────────────────────────────────

function DropletIcon({ size = 26 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2.5C12 2.5 5 9.5 5 14.5C5 18.36 8.13 21.5 12 21.5C15.87 21.5 19 18.36 19 14.5C19 9.5 12 2.5 12 2.5Z"
        fill={T.primary}
      />
      <G transform="rotate(-20 9.5 15)">
        <Ellipse
          cx="9.5"
          cy="15"
          rx="1.5"
          ry="2.5"
          fill="rgba(255,255,255,0.25)"
        />
      </G>
    </Svg>
  );
}

function NavIcon({ type, active }) {
  const c = active ? T.onPrimary : T.fgMuted;
  if (type === "home") {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3 9.5L12 3L21 9.5V20C21 20.55 20.55 21 20 21H15V15H9V21H4C3.45 21 3 20.55 3 20V9.5Z"
          fill={c}
        />
      </Svg>
    );
  }
  if (type === "calc") {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
        <Rect
          x="4"
          y="2"
          width="16"
          height="20"
          rx="3"
          fill={c}
          opacity={0.15}
        />
        <Rect
          x="4"
          y="2"
          width="16"
          height="20"
          rx="3"
          stroke={c}
          strokeWidth="1.6"
        />
        <Path
          d="M8 7H16M8 12H16M8 17H12"
          stroke={c}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  if (type === "sync") {
    return (
      <Svg width={22} height={22} viewBox="0 0 24 24" fill={c}>
        <Path d="M12 4C9.07 4 6.54 5.56 5.15 7.9L3 6V12H9L6.68 9.68C7.71 7.79 9.72 6.5 12 6.5C14.97 6.5 17.45 8.55 18.07 11.3L20.52 10.71C19.64 6.92 16.15 4 12 4ZM12 20C14.93 20 17.46 18.44 18.85 16.1L21 18V12H15L17.32 14.32C16.29 16.21 14.28 17.5 12 17.5C9.03 17.5 6.55 15.45 5.93 12.7L3.48 13.29C4.36 17.08 7.85 20 12 20Z" />
      </Svg>
    );
  }
  // settings
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill={c}>
      <Path d="M12 15.5C10.07 15.5 8.5 13.93 8.5 12C8.5 10.07 10.07 8.5 12 8.5C13.93 8.5 15.5 10.07 15.5 12C15.5 13.93 13.93 15.5 12 15.5ZM19.43 12.97C19.47 12.65 19.5 12.33 19.5 12C19.5 11.67 19.47 11.34 19.43 11L21.54 9.37C21.73 9.22 21.78 8.95 21.66 8.73L19.66 5.27C19.54 5.05 19.27 4.97 19.05 5.05L16.56 6.05C16.04 5.65 15.48 5.32 14.87 5.07L14.49 2.42C14.46 2.18 14.25 2 14 2H10C9.75 2 9.54 2.18 9.51 2.42L9.13 5.07C8.52 5.32 7.96 5.66 7.44 6.05L4.95 5.05C4.72 4.96 4.46 5.05 4.34 5.27L2.34 8.73C2.21 8.95 2.27 9.22 2.46 9.37L4.57 11C4.53 11.34 4.5 11.67 4.5 12C4.5 12.33 4.53 12.65 4.57 12.97L2.46 14.63C2.27 14.78 2.22 15.05 2.34 15.27L4.34 18.73C4.46 18.95 4.73 19.03 4.95 18.95L7.44 17.95C7.96 18.35 8.52 18.68 9.13 18.93L9.51 21.58C9.54 21.82 9.75 22 10 22H14C14.25 22 14.46 21.82 14.49 21.58L14.87 18.93C15.48 18.68 16.04 18.34 16.56 17.95L19.05 18.95C19.28 19.04 19.54 18.95 19.66 18.73L21.66 15.27C21.78 15.05 21.73 14.78 21.54 14.63L19.43 12.97Z" />
    </Svg>
  );
}

function OAILogo() {
  return (
    <View style={styles.logoCircle}>
      <Svg width={20} height={20} viewBox="0 0 24 24">
        <Circle cx={12} cy={12} r={10} fill="#000" />
        <Circle cx={12} cy={12} r={4} fill="#fff" />
      </Svg>
    </View>
  );
}

function AnthLogo() {
  return (
    <View style={[styles.logoCircle, { backgroundColor: "#CC9B7A" }]}>
      <Svg width={16} height={16} viewBox="0 0 24 22">
        <Path
          d="M14.1 0h-4.2L0 22h4.7l1.9-5h10.8l1.9 5H24L14.1 0zm-6 13.5L12 3.8l3.9 9.7H8.1z"
          fill="white"
        />
      </Svg>
    </View>
  );
}

function GoogleLogo() {
  return (
    <View style={styles.logoCircle}>
      <Svg width={18} height={18} viewBox="0 0 24 24">
        <Path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <Path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <Path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <Path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </Svg>
    </View>
  );
}

function EmojiAvatar({ emoji, bg, size = 36 }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: size * 0.5 }}>{emoji}</Text>
    </View>
  );
}

function SectionHeader({ label }) {
  return <Text style={styles.sectionHeader}>{label}</Text>;
}

function GaugeRing({ pct }) {
  const r = 42;
  const size = 104;
  const cx = 52;
  const cy = 52;
  const circ = 2 * Math.PI * r;
  const validPct = Math.min(100, Math.max(0, pct));
  const strokeDashoffset = circ * (1 - validPct / 100);

  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={T.outlineVar}
          strokeWidth="8"
        />
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={T.primary}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          strokeDashoffset={`${strokeDashoffset}`}
        />
      </Svg>
      <View
        style={[
          StyleSheet.absoluteFillObject,
          { alignItems: "center", justifyContent: "center" },
        ]}
      >
        <Text
          style={{
            fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
            fontSize: 18,
            fontWeight: "700",
            color: T.primary,
          }}
        >
          {pct}%
        </Text>
        <Text style={{ fontSize: 9, color: T.fgDim }}>capacity</Text>
      </View>
    </View>
  );
}

function WeeklyBarChart() {
  const weekData = [
    { day: "Mon", v: 5.2 },
    { day: "Tue", v: 7.8 },
    { day: "Wed", v: 4.1 },
    { day: "Thu", v: 9.3 },
    { day: "Fri", v: 6.5 },
    { day: "Sat", v: 3.2 },
    { day: "Sun", v: 6.7 },
  ];
  const [selectedDay, setSelectedDay] = useState("Thu");
  const maxV = 10.0;

  return (
    <View style={styles.card}>
      <View style={styles.chartHeader}>
        <Text style={styles.cardTitle}>This Week</Text>
        <View style={styles.chartLegend}>
          <View style={[styles.legendDot, { backgroundColor: T.primary }]} />
          <Text style={styles.legendText}>L / day</Text>
        </View>
      </View>

      <View style={styles.chartArea}>
        {weekData.map((item) => {
          const isSelected = selectedDay === item.day;
          const barHeight = Math.max(8, (item.v / maxV) * 90);
          return (
            <TouchableOpacity
              key={item.day}
              activeOpacity={0.8}
              onPress={() => setSelectedDay(item.day)}
              style={styles.chartColumn}
            >
              <View style={styles.chartBarWrapper}>
                {isSelected && (
                  <View style={styles.tooltipBubble}>
                    <Text style={styles.tooltipText}>{item.v}L</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: barHeight,
                      backgroundColor: T.primary,
                      opacity: isSelected ? 1 : 0.5,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.chartDayLabel,
                  isSelected && { color: T.primary, fontWeight: "800" },
                ]}
              >
                {item.day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Dashboard Screen ─────────────────────────────────────────────────────────

function DashboardScreen({ providers }) {
  const totalL = Object.values(providers).reduce((s, p) => s + p.liters, 0);
  const totalTokens = Object.values(providers).reduce(
    (s, p) => s + p.tokens,
    0,
  );
  const maxL = Math.max(
    ...Object.values(providers).map((p) => p.liters),
    0.001,
  );
  const pct = Math.min(Math.round((totalL / 66) * 100), 100);
  const quip = showerQuip(totalL);

  const providerList = [
    {
      key: "ChatGPT",
      logo: <OAILogo />,
      name: "ChatGPT",
      model: "GPT-4o",
      barColor: T.primary,
    },
    {
      key: "Claude",
      logo: <AnthLogo />,
      name: "Claude",
      model: "3.5 Sonnet",
      barColor: "#CC9B7A",
    },
    {
      key: "Gemini",
      logo: <GoogleLogo />,
      name: "Gemini",
      model: "1.5 Pro",
      barColor: "#4285F4",
    },
  ];

  return (
    <ScrollView
      style={styles.screenScroll}
      contentContainerStyle={styles.screenContent}
    >
      {/* Top App Bar */}
      <View style={styles.appBar}>
        <View style={styles.brandRow}>
          <DropletIcon size={30} />
          <Text style={styles.brandTitle}>
            Hydro<Text style={{ color: T.primary }}>Prompt</Text>
          </Text>
        </View>
        <View style={styles.appBarRight}>
          <View style={styles.dateBadge}>
            <Text style={styles.dateBadgeText}>Sep 2026</Text>
          </View>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>JD</Text>
          </View>
        </View>
      </View>

      {/* Hero Card */}
      <View style={styles.heroCard}>
        <View style={styles.heroRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.heroSubheader}>Total Water Used</Text>
            <View style={styles.heroValueRow}>
              <Text style={styles.heroValueText}>
                {totalL > 0 ? totalL.toFixed(1) : "0"}
              </Text>
              <Text style={styles.heroUnitText}>L</Text>
            </View>
            <View style={styles.tokensBadge}>
              <Text style={styles.tokensBadgeText}>
                {totalTokens > 0
                  ? `${(totalTokens / 1000).toFixed(0)}k tokens`
                  : "No usage yet"}
              </Text>
            </View>
            {totalL > 0 ? (
              <Text style={styles.heroEquivText}>
                {Math.round(totalL / 0.5)} × 500 ml bottles 🧴 ·{" "}
                {(totalL / 10.2).toFixed(1)} min shower 🚿
              </Text>
            ) : (
              <Text style={styles.heroEquivText}>
                Start chatting to see your impact
              </Text>
            )}
          </View>
          <GaugeRing pct={pct} />
        </View>
      </View>

      {/* Shower Skip Forecast */}
      {totalL > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={{ fontSize: 18 }}>🚿</Text>
            <Text style={[styles.cardTitle, { marginLeft: 8 }]}>
              Shower Skip Forecast
            </Text>
            <View style={styles.tagBadge}>
              <Text style={styles.tagBadgeText}>eco-guilt</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>THIS MONTH</Text>
              <Text style={[styles.statValue, { color: T.primary }]}>
                {quip.monthly}
              </Text>
              <Text style={styles.statSub}>showers to skip</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>THIS YEAR</Text>
              <Text style={[styles.statValue, { color: "#FFB86C" }]}>
                {quip.yearly}
              </Text>
              <Text style={styles.statSub}>showers to skip</Text>
            </View>
          </View>

          <View style={styles.quoteBox}>
            <Text style={styles.quoteText}>💡 {quip.joke}</Text>
          </View>
        </View>
      )}

      {/* Provider Breakdown */}
      <View style={styles.card}>
        <Text style={[styles.cardTitle, { marginBottom: 14 }]}>
          Provider Breakdown
        </Text>
        {totalL === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 32, opacity: 0.4 }}>💧</Text>
            <Text style={styles.emptyTitle}>No usage recorded yet</Text>
            <Text style={styles.emptySub}>
              Connect your API keys in API Sync to start tracking water usage
            </Text>
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            {providerList.map(({ key, logo, name, model, barColor }) => {
              const { liters, tokens } = providers[key] || {
                liters: 0,
                tokens: 0,
              };
              const barPercent = Math.min(
                100,
                Math.round((liters / maxL) * 100),
              );
              const mlPer1k =
                tokens > 0 ? Math.round((liters / (tokens / 1000)) * 1000) : 0;

              return (
                <View key={key}>
                  <View style={styles.providerRow}>
                    <View style={{ opacity: liters === 0 ? 0.35 : 1 }}>
                      {logo}
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text
                        style={[
                          styles.providerName,
                          liters === 0 && { color: T.fgDim },
                        ]}
                      >
                        {name}{" "}
                        <Text style={styles.providerModel}>· {model}</Text>
                      </Text>
                      <Text style={styles.providerSub}>
                        {liters === 0
                          ? "No usage this month"
                          : `${(tokens / 1000).toFixed(0)}k tokens`}
                      </Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={[
                          styles.providerLiters,
                          liters === 0 && { color: T.fgDim },
                        ]}
                      >
                        {liters === 0 ? "— L" : `${liters.toFixed(1)} L`}
                      </Text>
                      <Text style={styles.providerRate}>
                        {liters === 0
                          ? "not tracked"
                          : `${rates[key] || mlPer1k} ml/1k`}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressBarTrack}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: liters === 0 ? "0%" : `${barPercent}%`,
                          backgroundColor: barColor,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Weekly Chart */}
      <WeeklyBarChart />
    </ScrollView>
  );
}

// ─── Calculator Screen ───────────────────────────────────────────────────────

function CalculatorScreen({ customModels }) {
  const [provider, setProvider] = useState("Claude");
  const [model, setModel] = useState("Claude 3.5 Sonnet");
  const [inputTok, setInput] = useState(50000);
  const [outputTok, setOutput] = useState(10000);
  const [scopeTwo, setScope] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const mlPer1k = rates[provider] || 25;
  const totalMl =
    ((inputTok + outputTok) / 1000) * mlPer1k * (scopeTwo ? 1.35 : 1);
  const totalL = totalMl / 1000;
  const glasses = Math.round((totalMl / 250) * 10) / 10;
  const quip = showerQuip(totalL);
  const fmtTok = (v) =>
    v >= 1e6 ? `${(v / 1e6).toFixed(1)}M` : `${(v / 1000).toFixed(0)}k`;

  const availableModels = [
    ...(modelOpts[provider] || []),
    ...customModels.map((m) => `${m.emoji} ${m.name} (custom)`),
  ];

  return (
    <ScrollView
      style={styles.screenScroll}
      contentContainerStyle={styles.screenContent}
    >
      <View style={styles.headerBlock}>
        <Text style={styles.headerTitle}>Footprint Simulator</Text>
        <Text style={styles.headerSub}>
          Estimate water usage before running massive prompts or batch jobs
        </Text>
      </View>

      {/* Provider Selection */}
      <View style={styles.card}>
        <SectionHeader label="MODEL" />
        <View style={styles.segmentedRow}>
          {["ChatGPT", "Claude", "Gemini"].map((p) => {
            const active = provider === p;
            return (
              <TouchableOpacity
                key={p}
                style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                onPress={() => {
                  setProvider(p);
                  setModel(modelOpts[p][0]);
                }}
              >
                <Text
                  style={[
                    styles.segmentBtnText,
                    active && styles.segmentBtnTextActive,
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Model Picker trigger */}
        <TouchableOpacity
          style={styles.pickerTrigger}
          onPress={() => setShowPicker(true)}
        >
          <Text style={styles.pickerTriggerText}>{model}</Text>
          <Text style={styles.pickerArrow}>▾</Text>
        </TouchableOpacity>
      </View>

      {/* Sliders / Inputs */}
      <View style={styles.card}>
        {/* Input tokens */}
        <View style={{ marginBottom: 20 }}>
          <View style={styles.sliderHeaderRow}>
            <Text style={styles.sliderLabel}>INPUT TOKENS</Text>
            <TextInput
              style={styles.numberInput}
              keyboardType="numeric"
              value={String(inputTok)}
              onChangeText={(t) => {
                const n = parseInt(t, 10);
                setInput(isNaN(n) ? 0 : Math.min(1000000, Math.max(0, n)));
              }}
            />
          </View>
          <View style={styles.presetsRow}>
            {[10000, 50000, 100000, 500000, 1000000].map((v) => (
              <TouchableOpacity
                key={v}
                style={[
                  styles.presetChip,
                  inputTok === v && styles.presetChipActive,
                ]}
                onPress={() => setInput(v)}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    inputTok === v && styles.presetChipTextActive,
                  ]}
                >
                  {fmtTok(v)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.tokenBarTrack}>
            <View
              style={[
                styles.tokenBarFill,
                { width: `${Math.min(100, (inputTok / 1000000) * 100)}%` },
              ]}
            />
          </View>
          <View style={styles.sliderRangeRow}>
            <Text style={styles.sliderRangeText}>0</Text>
            <Text style={styles.sliderRangeText}>{fmtTok(inputTok)} / 1M</Text>
          </View>
        </View>

        {/* Output tokens */}
        <View>
          <View style={styles.sliderHeaderRow}>
            <Text style={styles.sliderLabel}>OUTPUT TOKENS</Text>
            <TextInput
              style={styles.numberInput}
              keyboardType="numeric"
              value={String(outputTok)}
              onChangeText={(t) => {
                const n = parseInt(t, 10);
                setOutput(isNaN(n) ? 0 : Math.min(200000, Math.max(0, n)));
              }}
            />
          </View>
          <View style={styles.presetsRow}>
            {[2000, 10000, 30000, 100000, 200000].map((v) => (
              <TouchableOpacity
                key={v}
                style={[
                  styles.presetChip,
                  outputTok === v && styles.presetChipActive,
                ]}
                onPress={() => setOutput(v)}
              >
                <Text
                  style={[
                    styles.presetChipText,
                    outputTok === v && styles.presetChipTextActive,
                  ]}
                >
                  {fmtTok(v)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.tokenBarTrack}>
            <View
              style={[
                styles.tokenBarFill,
                { width: `${Math.min(100, (outputTok / 200000) * 100)}%` },
              ]}
            />
          </View>
          <View style={styles.sliderRangeRow}>
            <Text style={styles.sliderRangeText}>0</Text>
            <Text style={styles.sliderRangeText}>
              {fmtTok(outputTok)} / 200k
            </Text>
          </View>
        </View>
      </View>

      {/* Scope 2 toggle */}
      <View style={styles.scopeCard}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <Text style={styles.scopeTitle}>Scope 2 Grid Cooling</Text>
          <Text style={styles.scopeSub}>
            {scopeTwo
              ? "Thermoelectric cooling included (+35%)"
              : "Direct on-site cooling only"}
          </Text>
        </View>
        <Switch
          value={scopeTwo}
          onValueChange={setScope}
          trackColor={{ false: T.surfaceCHi, true: T.primary }}
          thumbColor={scopeTwo ? T.onPrimary : T.fgDim}
        />
      </View>

      {/* Result Card */}
      <View style={styles.resultCard}>
        <SectionHeader label="ESTIMATED FOOTPRINT" />
        <View style={styles.resultValueRow}>
          <Text style={styles.resultLargeText}>
            {totalL >= 1 ? totalL.toFixed(2) : totalMl.toFixed(0)}
          </Text>
          <Text style={styles.resultUnitText}>{totalL >= 1 ? "L" : "mL"}</Text>
        </View>
        <Text style={styles.resultSubText}>
          {totalMl.toFixed(0)} mL · {glasses} × 250 ml glasses 🥛
        </Text>

        <View style={styles.quipInnerCard}>
          <Text style={styles.quipInnerTitle}>🚿 Showers to skip</Text>
          <View style={styles.quipStatsRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.quipStatNum, { color: T.primary }]}>
                {quip.monthly}
              </Text>
              <Text style={styles.quipStatLabel}>this month</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.quipStatNum, { color: "#FFB86C" }]}>
                {quip.yearly}
              </Text>
              <Text style={styles.quipStatLabel}>this year</Text>
            </View>
          </View>
          <Text style={styles.quipJokeText}>{quip.joke}</Text>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saved && { backgroundColor: "#4ADE80" }]}
          onPress={() => {
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
          }}
        >
          <Text style={styles.saveBtnText}>
            {saved ? "✓ Saved to Log" : "Save to Log"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Model Picker Modal */}
      <Modal visible={showPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Model</Text>
            {availableModels.map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.modalItem,
                  model === m && styles.modalItemActive,
                ]}
                onPress={() => {
                  setModel(m);
                  setShowPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.modalItemText,
                    model === m && { color: T.primary, fontWeight: "800" },
                  ]}
                >
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

// ─── Settings Screen ─────────────────────────────────────────────────────────

function SettingsScreen({
  customModels,
  setCustomModels,
  onReset,
  onResetMonth,
}) {
  const [newName, setNewName] = useState("");
  const [newMl, setNewMl] = useState("25");
  const [newEmoji, setNewEmoji] = useState("🤖");
  const [newBg, setNewBg] = useState(BG_PALETTE[0]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [expandCmd, setExpandCmd] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const addModel = () => {
    const ml = parseFloat(newMl);
    if (!newName.trim() || isNaN(ml) || ml <= 0) return;
    setCustomModels([
      ...customModels,
      {
        id: Date.now().toString(),
        name: newName.trim(),
        emoji: newEmoji,
        bgColor: newBg,
        mlPer1k: ml,
        tokens: 0,
      },
    ]);
    setNewName("");
    setNewMl("25");
  };

  const removeModel = (id) => {
    setCustomModels(customModels.filter((m) => m.id !== id));
  };

  const copyCode = (code, index) => {
    setCopiedIdx(index);
    setTimeout(() => setCopiedIdx(null), 2000);
    Alert.alert("Copied to clipboard", "The command snippet has been copied.");
  };

  const confirmAction = (title, message, onConfirm) => {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: "Yes, reset", style: "destructive", onPress: onConfirm },
    ]);
  };

  return (
    <ScrollView
      style={styles.screenScroll}
      contentContainerStyle={styles.screenContent}
    >
      <View style={styles.headerBlock}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSub}>
          Custom models, data management & API helpers
        </Text>
      </View>

      {/* Custom AI Models */}
      <View style={styles.card}>
        <SectionHeader label="CUSTOM AI MODELS" />

        <View style={styles.customModelForm}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              style={[styles.textInput, { flex: 1 }]}
              placeholder="Model name…"
              placeholderTextColor={T.fgDim}
              value={newName}
              onChangeText={setNewName}
            />
            <View style={styles.mlInputWrapper}>
              <TextInput
                style={styles.mlInput}
                keyboardType="numeric"
                value={newMl}
                onChangeText={setNewMl}
              />
              <Text style={styles.mlInputLabel}>ml/1k</Text>
            </View>
          </View>

          <View style={styles.formRowIcons}>
            <TouchableOpacity
              style={[styles.emojiPickBtn, { backgroundColor: newBg }]}
              onPress={() => setShowEmoji(!showEmoji)}
            >
              <Text style={{ fontSize: 20 }}>{newEmoji}</Text>
            </TouchableOpacity>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 6 }}
            >
              {BG_PALETTE.map((bg) => (
                <TouchableOpacity
                  key={bg}
                  style={[
                    styles.colorDot,
                    { backgroundColor: bg },
                    newBg === bg && { borderColor: T.primary, borderWidth: 2 },
                  ]}
                  onPress={() => setNewBg(bg)}
                />
              ))}
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.addBtn,
                newName.trim() && { backgroundColor: T.primary },
              ]}
              onPress={addModel}
            >
              <Text
                style={[
                  styles.addBtnText,
                  newName.trim() && { color: T.onPrimary },
                ]}
              >
                Add
              </Text>
            </TouchableOpacity>
          </View>

          {showEmoji && (
            <View style={styles.emojiGrid}>
              {EMOJI_PALETTE.map((e) => (
                <TouchableOpacity
                  key={e}
                  style={styles.emojiCell}
                  onPress={() => {
                    setNewEmoji(e);
                    setShowEmoji(false);
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {customModels.length === 0 ? (
          <Text style={styles.emptyCustomText}>No custom models added yet</Text>
        ) : (
          <View style={{ gap: 8 }}>
            {customModels.map((m) => (
              <View key={m.id} style={styles.customModelItem}>
                <EmojiAvatar emoji={m.emoji} bg={m.bgColor} size={36} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.customModelName}>{m.name}</Text>
                  <Text style={styles.customModelRate}>
                    {m.mlPer1k} ml / 1k tokens
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => removeModel(m.id)}
                >
                  <Text style={styles.deleteBtnText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* API Token Commands */}
      <View style={styles.card}>
        <SectionHeader label="API TOKEN COMMANDS" />
        <Text style={styles.apiCommandsSub}>
          Copy-paste these into your agent or terminal to retrieve token usage
          from each provider.
        </Text>

        <View style={{ gap: 8 }}>
          {API_COMMANDS.map((cmd, i) => {
            const isExpanded = expandCmd === i;
            return (
              <View key={i} style={styles.accordionCard}>
                <TouchableOpacity
                  style={styles.accordionHeader}
                  onPress={() => setExpandCmd(isExpanded ? null : i)}
                >
                  <Text style={{ fontSize: 18 }}>{cmd.icon}</Text>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.accordionTitle}>{cmd.title}</Text>
                    <Text style={styles.accordionDesc}>{cmd.description}</Text>
                  </View>
                  <Text
                    style={[
                      styles.accordionChevron,
                      isExpanded && { transform: [{ rotate: "90deg" }] },
                    ]}
                  >
                    ›
                  </Text>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.accordionBody}>
                    <Text style={styles.codeSnippet}>{cmd.code}</Text>
                    <View style={{ alignItems: "flex-end", marginTop: 8 }}>
                      <TouchableOpacity
                        style={[
                          styles.copyBtn,
                          copiedIdx === i && {
                            backgroundColor: T.priContainer,
                          },
                        ]}
                        onPress={() => copyCode(cmd.code, i)}
                      >
                        <Text
                          style={[
                            styles.copyBtnText,
                            copiedIdx === i && { color: T.primary },
                          ]}
                        >
                          {copiedIdx === i ? "✓ Copied" : "Copy"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.card}>
        <SectionHeader label="DATA MANAGEMENT" />
        <View style={{ gap: 8 }}>
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() =>
              confirmAction(
                "Reset This Month's Data",
                "Clears all usage for September 2026",
                onResetMonth,
              )
            }
          >
            <View>
              <Text style={styles.resetBtnTitle}>Reset This Month's Data</Text>
              <Text style={styles.resetBtnSub}>
                Clears all usage for September 2026
              </Text>
            </View>
            <Text style={styles.resetBtnArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() =>
              confirmAction(
                "Reset All Data",
                "Permanently wipes all usage history and logs",
                onReset,
              )
            }
          >
            <View>
              <Text style={[styles.resetBtnTitle, { color: T.error }]}>
                Reset All Data
              </Text>
              <Text style={styles.resetBtnSub}>
                Permanently wipes all usage history and logs
              </Text>
            </View>
            <Text style={[styles.resetBtnArrow, { color: T.error }]}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.appFooterText}>HydroPrompt v1.0.0 · defnotme77 </Text>
    </ScrollView>
  );
}

// ─── API Sync Screen ─────────────────────────────────────────────────────────

function ApiSyncScreen() {
  return (
    <View style={styles.syncContainer}>
      <DropletIcon size={56} />
      <Text style={styles.syncTitle}>API Sync</Text>
      <Text style={styles.syncSubtitle}>
        Direct integration with OpenAI, Anthropic & Google API coming soon
      </Text>
    </View>
  );
}

// ─── Main Root Component ─────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState("home");
  const [providers, setProviders] = useState(DEFAULT_PROVIDERS);
  const [customModels, setCustomModels] = useState([]);

  const handleResetMonth = () => {
    setProviders({
      ChatGPT: { liters: 0, tokens: 0 },
      Claude: { liters: 0, tokens: 0 },
      Gemini: { liters: 0, tokens: 0 },
    });
  };

  const handleResetAll = () => {
    setProviders({
      ChatGPT: { liters: 0, tokens: 0 },
      Claude: { liters: 0, tokens: 0 },
      Gemini: { liters: 0, tokens: 0 },
    });
    setCustomModels([]);
  };

  const navItems = [
    { id: "home", label: "Dashboard" },
    { id: "calc", label: "Calculator" },
    { id: "sync", label: "API Sync" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.mainContainer}>
        {/* Active Screen */}
        <View style={{ flex: 1 }}>
          {tab === "home" && <DashboardScreen providers={providers} />}
          {tab === "calc" && <CalculatorScreen customModels={customModels} />}
          {tab === "sync" && <ApiSyncScreen />}
          {tab === "settings" && (
            <SettingsScreen
              customModels={customModels}
              setCustomModels={setCustomModels}
              onReset={handleResetAll}
              onResetMonth={handleResetMonth}
            />
          )}
        </View>

        {/* Bottom Navigation with Safe Area Padding */}
        <View style={styles.bottomNav}>
          {navItems.map(({ id, label }) => {
            const active = tab === id;
            return (
              <TouchableOpacity
                key={id}
                style={styles.navItem}
                onPress={() => setTab(id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.navIconPill,
                    active && styles.navIconPillActive,
                  ]}
                >
                  <NavIcon type={id} active={active} />
                </View>
                <Text
                  style={[styles.navLabel, active && styles.navLabelActive]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Stylesheet ──────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: T.bg,
    paddingTop: Platform.OS === "android" ? RNStatusBar.currentHeight || 24 : 0,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: T.bg,
  },
  screenScroll: {
    flex: 1,
  },
  screenContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginBottom: 6,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: T.fg,
    letterSpacing: -0.5,
  },
  appBarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  dateBadge: {
    backgroundColor: T.surfaceC,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 100,
  },
  dateBadgeText: {
    color: T.fgMuted,
    fontSize: 12,
    fontWeight: "600",
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: T.priContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarText: {
    color: T.primary,
    fontWeight: "800",
    fontSize: 13,
  },
  heroCard: {
    backgroundColor: T.priContainer,
    borderRadius: 28,
    padding: 20,
    marginBottom: 14,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  heroSubheader: {
    color: T.onPriC,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  heroValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  heroValueText: {
    color: T.onPriC,
    fontSize: 48,
    fontWeight: "900",
    lineHeight: 52,
    letterSpacing: -1,
  },
  heroUnitText: {
    color: T.primary,
    fontSize: 24,
    fontWeight: "700",
    marginLeft: 4,
  },
  tokensBadge: {
    backgroundColor: "rgba(125,217,135,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    alignSelf: "flex-start",
    marginTop: 8,
    marginBottom: 10,
  },
  tokensBadgeText: {
    color: T.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  heroEquivText: {
    color: T.onPriC,
    opacity: 0.8,
    fontSize: 12,
    lineHeight: 18,
  },
  card: {
    backgroundColor: T.surfaceC,
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    color: T.fg,
    fontSize: 15,
    fontWeight: "800",
  },
  tagBadge: {
    backgroundColor: T.surfaceCH,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 100,
    marginLeft: "auto",
  },
  tagBadgeText: {
    color: T.fgDim,
    fontSize: 10,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: T.surfaceCH,
    borderRadius: 18,
    padding: 14,
  },
  statLabel: {
    color: T.fgDim,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "600",
    marginVertical: 4,
  },
  statSub: {
    color: T.fgMuted,
    fontSize: 11,
  },
  quoteBox: {
    borderLeftWidth: 3,
    borderLeftColor: T.outlineVar,
    paddingLeft: 12,
    marginTop: 4,
  },
  quoteText: {
    color: T.fgDim,
    fontSize: 12,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 20,
    gap: 8,
  },
  emptyTitle: {
    color: T.fgDim,
    fontSize: 13,
    fontWeight: "700",
  },
  emptySub: {
    color: T.fgDim,
    fontSize: 11,
    textAlign: "center",
    maxWidth: 240,
    lineHeight: 16,
  },
  providerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  logoCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  providerName: {
    color: T.fg,
    fontSize: 13,
    fontWeight: "800",
  },
  providerModel: {
    color: T.fgDim,
    fontSize: 11,
    fontWeight: "500",
  },
  providerSub: {
    color: T.fgDim,
    fontSize: 11,
    marginTop: 1,
  },
  providerLiters: {
    color: T.fg,
    fontSize: 15,
    fontWeight: "700",
  },
  providerRate: {
    color: T.fgDim,
    fontSize: 10,
    marginTop: 1,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: T.surfaceCHi,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  chartHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  chartLegend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: T.fgDim,
    fontSize: 11,
  },
  chartArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
    paddingTop: 10,
  },
  chartColumn: {
    alignItems: "center",
    flex: 1,
  },
  chartBarWrapper: {
    alignItems: "center",
    justifyContent: "flex-end",
    height: 95,
  },
  tooltipBubble: {
    backgroundColor: T.surfaceCH,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  tooltipText: {
    color: T.primary,
    fontSize: 9,
    fontWeight: "700",
  },
  chartBar: {
    width: 20,
    borderRadius: 6,
  },
  chartDayLabel: {
    color: T.fgDim,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
  },
  headerBlock: {
    paddingVertical: 12,
  },
  headerTitle: {
    color: T.fg,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  headerSub: {
    color: T.fgDim,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  sectionHeader: {
    color: T.fgDim,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  segmentedRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    backgroundColor: T.surfaceCH,
    paddingVertical: 9,
    borderRadius: 100,
    alignItems: "center",
  },
  segmentBtnActive: {
    backgroundColor: T.primary,
  },
  segmentBtnText: {
    color: T.fgMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  segmentBtnTextActive: {
    color: T.onPrimary,
  },
  pickerTrigger: {
    backgroundColor: T.surfaceCH,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerTriggerText: {
    color: T.fg,
    fontSize: 13,
    fontWeight: "700",
  },
  pickerArrow: {
    color: T.fgDim,
    fontSize: 14,
  },
  sliderHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sliderLabel: {
    color: T.fgMuted,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  numberInput: {
    backgroundColor: T.surfaceCH,
    color: T.primary,
    fontSize: 14,
    fontWeight: "700",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 80,
    textAlign: "right",
  },
  presetsRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  presetChip: {
    backgroundColor: T.surfaceCH,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  presetChipActive: {
    backgroundColor: T.priContainer,
    borderWidth: 1,
    borderColor: T.primary,
  },
  presetChipText: {
    color: T.fgMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  presetChipTextActive: {
    color: T.primary,
  },
  tokenBarTrack: {
    height: 6,
    backgroundColor: T.surfaceCHi,
    borderRadius: 3,
    overflow: "hidden",
  },
  tokenBarFill: {
    height: 6,
    backgroundColor: T.primary,
    borderRadius: 3,
  },
  sliderRangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  sliderRangeText: {
    color: T.fgDim,
    fontSize: 10,
  },
  scopeCard: {
    backgroundColor: T.surfaceC,
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scopeTitle: {
    color: T.fg,
    fontSize: 13,
    fontWeight: "800",
  },
  scopeSub: {
    color: T.fgDim,
    fontSize: 11,
    marginTop: 2,
  },
  resultCard: {
    backgroundColor: T.priContainer,
    borderRadius: 28,
    padding: 20,
    marginBottom: 14,
  },
  resultValueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  resultLargeText: {
    color: T.primary,
    fontSize: 48,
    fontWeight: "900",
    lineHeight: 52,
    letterSpacing: -1,
  },
  resultUnitText: {
    color: T.primary,
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 4,
  },
  resultSubText: {
    color: T.onPriC,
    opacity: 0.8,
    fontSize: 12,
    marginBottom: 16,
  },
  quipInnerCard: {
    backgroundColor: "rgba(0,0,0,0.2)",
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  quipInnerTitle: {
    color: T.onPriC,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
  },
  quipStatsRow: {
    flexDirection: "row",
    gap: 12,
  },
  quipStatNum: {
    fontSize: 20,
    fontWeight: "700",
  },
  quipStatLabel: {
    color: T.onPriC,
    opacity: 0.6,
    fontSize: 10,
    marginTop: 2,
  },
  quipJokeText: {
    color: T.onPriC,
    opacity: 0.6,
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 8,
  },
  saveBtn: {
    backgroundColor: T.primary,
    borderRadius: 100,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveBtnText: {
    color: T.onPrimary,
    fontSize: 14,
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: T.surfaceC,
    width: "100%",
    borderRadius: 24,
    padding: 20,
    gap: 8,
  },
  modalTitle: {
    color: T.fg,
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  modalItem: {
    backgroundColor: T.surfaceCH,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  modalItemActive: {
    borderWidth: 1,
    borderColor: T.primary,
  },
  modalItemText: {
    color: T.fg,
    fontSize: 13,
    fontWeight: "600",
  },
  customModelForm: {
    gap: 10,
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: T.surfaceCH,
    color: T.fg,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
  mlInputWrapper: {
    backgroundColor: T.surfaceCH,
    borderRadius: 12,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  mlInput: {
    color: T.primary,
    fontSize: 13,
    fontWeight: "700",
    width: 40,
    textAlign: "right",
  },
  mlInputLabel: {
    color: T.fgDim,
    fontSize: 10,
    marginLeft: 4,
  },
  formRowIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  emojiPickBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  colorDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  addBtn: {
    backgroundColor: T.surfaceCHi,
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 100,
  },
  addBtnText: {
    color: T.fgDim,
    fontSize: 13,
    fontWeight: "800",
  },
  emojiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    backgroundColor: T.surfaceCHi,
    padding: 10,
    borderRadius: 16,
  },
  emojiCell: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCustomText: {
    color: T.fgDim,
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 10,
  },
  customModelItem: {
    backgroundColor: T.surfaceCH,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
  },
  customModelName: {
    color: T.fg,
    fontSize: 13,
    fontWeight: "700",
  },
  customModelRate: {
    color: T.fgDim,
    fontSize: 11,
    marginTop: 2,
  },
  deleteBtn: {
    backgroundColor: T.errorC,
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnText: {
    color: T.error,
    fontSize: 16,
    fontWeight: "700",
  },
  apiCommandsSub: {
    color: T.fgDim,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  accordionCard: {
    backgroundColor: T.surfaceCH,
    borderRadius: 18,
    overflow: "hidden",
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
  },
  accordionTitle: {
    color: T.fg,
    fontSize: 13,
    fontWeight: "700",
  },
  accordionDesc: {
    color: T.fgDim,
    fontSize: 11,
    marginTop: 2,
  },
  accordionChevron: {
    color: T.fgDim,
    fontSize: 18,
  },
  accordionBody: {
    borderTopWidth: 1,
    borderTopColor: T.outlineVar,
    padding: 14,
  },
  codeSnippet: {
    backgroundColor: T.bg,
    color: T.onPriC,
    fontSize: 10,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    padding: 12,
    borderRadius: 12,
    lineHeight: 16,
  },
  copyBtn: {
    backgroundColor: T.surfaceCHi,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 100,
  },
  copyBtnText: {
    color: T.fgMuted,
    fontSize: 11,
    fontWeight: "700",
  },
  resetBtn: {
    backgroundColor: T.surfaceCH,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
  },
  resetBtnTitle: {
    color: T.fg,
    fontSize: 13,
    fontWeight: "700",
  },
  resetBtnSub: {
    color: T.fgDim,
    fontSize: 11,
    marginTop: 2,
  },
  resetBtnArrow: {
    color: T.fgDim,
    fontSize: 18,
  },
  appFooterText: {
    color: T.fgDim,
    fontSize: 11,
    textAlign: "center",
    marginTop: 12,
  },
  syncContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  syncTitle: {
    color: T.fg,
    fontSize: 18,
    fontWeight: "800",
  },
  syncSubtitle: {
    color: T.fgDim,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 260,
  },
  bottomNav: {
    backgroundColor: T.surface,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
    paddingBottom: Platform.OS === "android" ? 56 : 20,
    borderTopWidth: 1,
    borderTopColor: T.outlineVar,
  },
  navItem: {
    alignItems: "center",
    minWidth: 64,
  },
  navIconPill: {
    width: 60,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  navIconPillActive: {
    backgroundColor: T.primary,
  },
  navLabel: {
    color: T.fgDim,
    fontSize: 10,
    fontWeight: "600",
  },
  navLabelActive: {
    color: T.primary,
    fontWeight: "800",
  },
});
