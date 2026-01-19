/**
 * Logo Components - Protocol: Silent Night Branding
 *
 * SVG-based logo variants for different use cases:
 * - Full logo with text
 * - Icon only (app icon style)
 * - Wordmark only
 *
 * Dark Yuletide Theme:
 * - Corrupted snowflake motif
 * - Circuit board patterns
 * - Ominous glow effects
 */

import Svg, {
  Path,
  Circle,
  G,
  Defs,
  RadialGradient,
  Stop,
  LinearGradient,
  Text as SvgText,
  TSpan,
} from 'react-native-svg';
import { darkYuletideColors } from '@protocol-silent-night/design-system/themes/darkYuletide';

interface LogoProps {
  size?: number;
  color?: string;
  glowColor?: string;
}

/**
 * Main logo icon - Corrupted snowflake with circuit patterns
 */
export function LogoIcon({
  size = 64,
  color = darkYuletideColors.primary.main,
  glowColor = darkYuletideColors.primary.glow,
}: LogoProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Defs>
        <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={glowColor} />
          <Stop offset="100%" stopColor="transparent" />
        </RadialGradient>
        <LinearGradient id="circuit" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={color} />
          <Stop offset="100%" stopColor={darkYuletideColors.accent.main} />
        </LinearGradient>
      </Defs>

      {/* Glow background */}
      <Circle cx="32" cy="32" r="30" fill="url(#glow)" opacity="0.5" />

      {/* Main snowflake arms */}
      <G stroke="url(#circuit)" strokeWidth="2" fill="none">
        {/* Vertical arm */}
        <Path d="M32 4 L32 60" />
        {/* Horizontal arm */}
        <Path d="M4 32 L60 32" />
        {/* Diagonal arms */}
        <Path d="M12 12 L52 52" />
        <Path d="M52 12 L12 52" />
      </G>

      {/* Circuit nodes */}
      <G fill={color}>
        <Circle cx="32" cy="32" r="4" />
        <Circle cx="32" cy="8" r="2" />
        <Circle cx="32" cy="56" r="2" />
        <Circle cx="8" cy="32" r="2" />
        <Circle cx="56" cy="32" r="2" />
        <Circle cx="14" cy="14" r="2" />
        <Circle cx="50" cy="50" r="2" />
        <Circle cx="50" cy="14" r="2" />
        <Circle cx="14" cy="50" r="2" />
      </G>

      {/* Branch details */}
      <G stroke={color} strokeWidth="1.5" fill="none">
        {/* Top branches */}
        <Path d="M32 16 L24 12" />
        <Path d="M32 16 L40 12" />
        {/* Bottom branches */}
        <Path d="M32 48 L24 52" />
        <Path d="M32 48 L40 52" />
        {/* Left branches */}
        <Path d="M16 32 L12 24" />
        <Path d="M16 32 L12 40" />
        {/* Right branches */}
        <Path d="M48 32 L52 24" />
        <Path d="M48 32 L52 40" />
      </G>

      {/* Corrupted glitch effect - offset lines */}
      <G stroke={darkYuletideColors.secondary.main} strokeWidth="1" opacity="0.6">
        <Path d="M30 4 L30 12" />
        <Path d="M34 52 L34 60" />
      </G>
    </Svg>
  );
}

/**
 * Full logo with text
 */
export function LogoFull({
  size = 200,
  color = darkYuletideColors.primary.main,
}: LogoProps) {
  const iconSize = size * 0.3;
  const textSize = size * 0.12;
  const subtitleSize = size * 0.06;

  return (
    <Svg width={size} height={size * 0.6} viewBox="0 0 200 120">
      <Defs>
        <LinearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={color} />
          <Stop offset="50%" stopColor={darkYuletideColors.text.primary} />
          <Stop offset="100%" stopColor={color} />
        </LinearGradient>
      </Defs>

      {/* Icon */}
      <G transform="translate(70, 10) scale(0.7)">
        <LogoIconPath color={color} />
      </G>

      {/* PROTOCOL: text */}
      <SvgText
        x="100"
        y="75"
        fontSize={subtitleSize}
        fill={color}
        textAnchor="middle"
        fontWeight="600"
        letterSpacing="4"
      >
        PROTOCOL:
      </SvgText>

      {/* SILENT NIGHT text */}
      <SvgText
        x="100"
        y="100"
        fontSize={textSize}
        fill="url(#textGradient)"
        textAnchor="middle"
        fontWeight="900"
        letterSpacing="2"
      >
        SILENT NIGHT
      </SvgText>
    </Svg>
  );
}

/**
 * Wordmark only (no icon)
 */
export function LogoWordmark({
  size = 200,
  color = darkYuletideColors.primary.main,
}: LogoProps) {
  const textSize = size * 0.15;
  const subtitleSize = size * 0.07;

  return (
    <Svg width={size} height={size * 0.35} viewBox="0 0 200 70">
      <Defs>
        <LinearGradient id="wordmarkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor={color} />
          <Stop offset="50%" stopColor={darkYuletideColors.text.primary} />
          <Stop offset="100%" stopColor={color} />
        </LinearGradient>
      </Defs>

      {/* PROTOCOL: */}
      <SvgText
        x="100"
        y="25"
        fontSize={subtitleSize}
        fill={color}
        textAnchor="middle"
        fontWeight="600"
        letterSpacing="4"
      >
        PROTOCOL:
      </SvgText>

      {/* SILENT NIGHT */}
      <SvgText
        x="100"
        y="55"
        fontSize={textSize}
        fill="url(#wordmarkGradient)"
        textAnchor="middle"
        fontWeight="900"
        letterSpacing="2"
      >
        SILENT NIGHT
      </SvgText>
    </Svg>
  );
}

/**
 * Internal helper - Logo icon paths only (for embedding)
 */
function LogoIconPath({ color }: { color: string }) {
  return (
    <G>
      <G stroke={color} strokeWidth="2" fill="none">
        <Path d="M32 4 L32 60" />
        <Path d="M4 32 L60 32" />
        <Path d="M12 12 L52 52" />
        <Path d="M52 12 L12 52" />
      </G>
      <G fill={color}>
        <Circle cx="32" cy="32" r="4" />
        <Circle cx="32" cy="8" r="2" />
        <Circle cx="32" cy="56" r="2" />
        <Circle cx="8" cy="32" r="2" />
        <Circle cx="56" cy="32" r="2" />
      </G>
    </G>
  );
}

/**
 * Animated loading logo (pulses)
 */
export function LogoLoading({
  size = 64,
  color = darkYuletideColors.primary.main,
}: LogoProps) {
  // Note: Animation would be added with react-native-reanimated
  // For now, this is the static version
  return <LogoIcon size={size} color={color} />;
}
