import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const slides = [
  {
    title: 'Welcome to ForexAdvisor!',
    desc: 'Track your investments, check live forex rates, and get smart insights to grow your portfolio.'
  },
  {
    title: 'Add Investments',
    desc: 'Tap "New Investment" to add a position. You can track open and closed trades easily.'
  },
  {
    title: 'Analytics & Insights',
    desc: 'See your total profit/loss, best/worst trades, and more in the Analytics dashboard.'
  },
  {
    title: 'Set Reminders & Alerts',
    desc: 'Get notified about rate changes, trade events, and regular investment reminders.'
  },
];

export default function OnboardingModal({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const isLast = step === slides.length - 1;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{slides[step].title}</Text>
          <Text style={styles.desc}>{slides[step].desc}</Text>
          <View style={styles.dotsRow}>
            {slides.map((_, i) => (
              <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
            ))}
          </View>
          <View style={styles.btnRow}>
            {step < slides.length - 1 && (
              <TouchableOpacity onPress={onDone} style={styles.btnSkip}>
                <Text style={styles.btnText}>Skip</Text>
              </TouchableOpacity>
            )}
            {!isLast && (
              <TouchableOpacity onPress={() => setStep(s => s + 1)} style={styles.btnNext}>
                <Text style={styles.btnText}>Next</Text>
              </TouchableOpacity>
            )}
            {isLast && (
              <TouchableOpacity onPress={onDone} style={styles.btnDone}>
                <Text style={styles.btnText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 28,
    width: Dimensions.get('window').width * 0.85,
    alignItems: 'center',
    elevation: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1DE9B6',
    textAlign: 'center',
  },
  desc: {
    fontSize: 16,
    color: '#222',
    textAlign: 'center',
    marginBottom: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    marginBottom: 18,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#eee',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#1DE9B6',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  btnSkip: {
    marginRight: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  btnNext: {
    backgroundColor: '#1DE9B6',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  btnDone: {
    backgroundColor: '#43e97b',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 