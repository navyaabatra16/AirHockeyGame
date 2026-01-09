import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Pressable,
} from 'react-native';

const { width, height } = Dimensions.get('window');

/* ---------- CONSTANTS ---------- */
const BOARD_WIDTH = width * 0.9;
const BOARD_HEIGHT = height * 0.8;

const PUCK_SIZE = 22;
const PADDLE_SIZE = 80;
const SPEED = 4;
const WIN_SCORE = 10;
const ROUND_TIME = 60;

type GameMode = 'FIRST_TO_10' | 'TIMED';

/* ---------- APP ---------- */
export default function App() {
  /* ---------- GAME STATE ---------- */
  const [mode, setMode] = useState<GameMode | null>(null);
  const [started, setStarted] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);

  /* ---------- PUCK ---------- */
  const puck = useRef(
    new Animated.ValueXY({
      x: BOARD_WIDTH / 2 - PUCK_SIZE / 2,
      y: BOARD_HEIGHT / 2 - PUCK_SIZE / 2,
    })
  ).current;

  const puckVelocity = useRef({ x: SPEED, y: SPEED }).current;

  /* ---------- PADDLES ---------- */
  const paddleBottom = useRef(
    new Animated.ValueXY({
      x: BOARD_WIDTH / 2 - PADDLE_SIZE / 2,
      y: BOARD_HEIGHT - PADDLE_SIZE - 20,
    })
  ).current;

  const paddleTop = useRef(
    new Animated.ValueXY({
      x: BOARD_WIDTH / 2 - PADDLE_SIZE / 2,
      y: 20,
    })
  ).current;

  /* ---------- RESET ---------- */
  const resetPuck = () => {
    puck.setValue({
      x: BOARD_WIDTH / 2 - PUCK_SIZE / 2,
      y: BOARD_HEIGHT / 2 - PUCK_SIZE / 2,
    });
    puckVelocity.x = SPEED * (Math.random() > 0.5 ? 1 : -1);
    puckVelocity.y = SPEED * (Math.random() > 0.5 ? 1 : -1);
  };

  const resetGame = () => {
    setScore1(0);
    setScore2(0);
    setTimeLeft(ROUND_TIME);
    setWinner(null);
    setStarted(false);
    setMode(null);
    resetPuck();
  };

  /* ---------- GAME LOOP ---------- */
  useEffect(() => {
    if (!started || winner) return;

    const loop = setInterval(() => {
      const x = (puck.x as any)._value;
      const y = (puck.y as any)._value;

      let nx = x + puckVelocity.x;
      let ny = y + puckVelocity.y;

      /* Wall collision */
      if (nx <= 0 || nx >= BOARD_WIDTH - PUCK_SIZE) {
        puckVelocity.x *= -1;
      }

      /* Paddle collision */
      const p1 = (paddleBottom as any).__getValue?.() || (paddleBottom as any)._value;
      const p2 = (paddleTop as any).__getValue?.() || (paddleTop as any)._value;

      const hit = (px: number, py: number) =>
        nx + PUCK_SIZE > px &&
        nx < px + PADDLE_SIZE &&
        ny + PUCK_SIZE > py &&
        ny < py + PADDLE_SIZE;

      if (hit(p1.x, p1.y) || hit(p2.x, p2.y)) {
        puckVelocity.y *= -1;
      }

      /* Goals */
      if (ny <= 0) {
        setScore1(s => s + 1);
        resetPuck();
        return;
      }

      if (ny >= BOARD_HEIGHT - PUCK_SIZE) {
        setScore2(s => s + 1);
        resetPuck();
        return;
      }

      puck.setValue({ x: nx, y: ny });
    }, 16);

    return () => clearInterval(loop);
  }, [started, winner]);

  /* ---------- TIMER ---------- */
  useEffect(() => {
    if (mode !== 'TIMED' || !started || winner) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setWinner(score1 > score2 ? 'Player 1' : 'Player 2');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [started, mode]);

  /* ---------- WIN CONDITION ---------- */
  useEffect(() => {
    if (mode === 'FIRST_TO_10') {
      if (score1 >= WIN_SCORE) setWinner('Player 1');
      if (score2 >= WIN_SCORE) setWinner('Player 2');
    }
  }, [score1, score2]);

  /* ---------- PAN RESPONDERS ---------- */
  const panBottom = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => {
      paddleBottom.setValue({
        x: Math.max(0, Math.min(BOARD_WIDTH - PADDLE_SIZE, g.moveX - width * 0.05 - PADDLE_SIZE / 2)),
        y: Math.max(BOARD_HEIGHT / 2, Math.min(BOARD_HEIGHT - PADDLE_SIZE - 20, g.moveY - 100)),
      });
    },
  });

  const panTop = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => {
      paddleTop.setValue({
        x: Math.max(0, Math.min(BOARD_WIDTH - PADDLE_SIZE, g.moveX - width * 0.05 - PADDLE_SIZE / 2)),
        y: Math.min(BOARD_HEIGHT / 2 - PADDLE_SIZE, Math.max(20, g.moveY - 100)),
      });
    },
  });

  /* ---------- UI ---------- */
  return (
    <View style={styles.container}>

      {/* START MENU */}
      {!started && !winner && (
        <View style={styles.overlay}>
          <Text style={styles.title}>AIR HOCKEY</Text>

          <Pressable style={styles.menuBtn} onPress={() => { setMode('FIRST_TO_10'); setStarted(true); }}>
            <Text style={styles.menuText}>First to 10</Text>
          </Pressable>

          <Pressable style={styles.menuBtn} onPress={() => { setMode('TIMED'); setStarted(true); }}>
            <Text style={styles.menuText}>1 Minute Match</Text>
          </Pressable>
        </View>
      )}

      {/* SCORE */}
      <View style={styles.scoreGrid}>
        <View style={styles.scoreBox}>
          <Text style={styles.playerLabel}>Player 1</Text>
          <Text style={styles.scoreNum}>{score1}</Text>
        </View>
        <View style={styles.scoreBox}>
          <Text style={styles.playerLabel}>Player 2</Text>
          <Text style={styles.scoreNum}>{score2}</Text>
        </View>
      </View>

      {mode === 'TIMED' && <Text style={styles.timer}>⏱ {timeLeft}s</Text>}

      {/* BOARD */}
      <View style={styles.board}>
        <View style={styles.centerLine} />
        <View style={styles.centerCircle} />

        <Animated.View style={[styles.puck, puck.getLayout()]} />

        <Animated.View {...panTop.panHandlers} style={[styles.paddle, styles.paddleTop, paddleTop.getLayout()]} />
        <Animated.View {...panBottom.panHandlers} style={[styles.paddle, styles.paddleBottom, paddleBottom.getLayout()]} />
      </View>

      {/* WINNER */}
      {winner && (
        <View style={styles.overlay}>
          <Text style={styles.winner}>{winner} Wins 🎉</Text>
          <Pressable style={styles.menuBtn} onPress={resetGame}>
            <Text style={styles.menuText}>Restart</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b1c2d', alignItems: 'center', justifyContent: 'center' },

  board: { width: '90%', height: '80%', backgroundColor: '#1e3a5f', borderRadius: 20, borderWidth: 4, borderColor: '#fff' },

  centerLine: { position: 'absolute', width: '100%', height: 2, backgroundColor: '#ffffff55', top: '50%' },
  centerCircle: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#ffffff55', top: '50%', left: '50%', transform: [{ translateX: -40 }, { translateY: -40 }] },

  puck: { position: 'absolute', width: PUCK_SIZE, height: PUCK_SIZE, borderRadius: PUCK_SIZE / 2, backgroundColor: '#fff' },

  paddle: { position: 'absolute', width: PADDLE_SIZE, height: PADDLE_SIZE, borderRadius: PADDLE_SIZE / 2, borderWidth: 3, borderColor: '#fff' },
  paddleBottom: { backgroundColor: '#00e5ff' },
  paddleTop: { backgroundColor: '#ff7675' },

  scoreGrid: { flexDirection: 'row', gap: 20, marginBottom: 10 },
  scoreBox: { padding: 10, borderRadius: 10, borderWidth: 2, borderColor: '#ffffff55', alignItems: 'center' },
  playerLabel: { color: '#aaa', fontSize: 12 },
  scoreNum: { color: '#fff', fontSize: 24, fontWeight: 'bold' },

  timer: { color: '#fff', marginBottom: 6 },

  overlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: '#000000cc', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  title: { color: '#fff', fontSize: 32, marginBottom: 20, fontWeight: 'bold' },
  menuBtn: { backgroundColor: '#00e5ff', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 12, marginVertical: 8 },
  menuText: { color: '#003', fontWeight: 'bold' },
  winner: { color: '#fff', fontSize: 28, marginBottom: 20 },
});
