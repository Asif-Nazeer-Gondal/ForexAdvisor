import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Button, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useInvestments, Investment } from '../../hooks/useInvestments';
import { fetchForexRatePair, fetchHistoricalRates } from '../../services/forexService';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';

const FIELD_TOOLTIPS = {
  investedRate: 'The exchange rate at which you opened this position.',
  closedRate: 'The exchange rate at which you closed this position.',
  amount: 'The amount you invested in this trade.',
  profit: 'Profit or loss for this trade. Positive means gain, negative means loss.',
};

function Tooltip({ visible, onClose, text }: { visible: boolean; onClose: () => void; text: string }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.tooltipOverlay} onPress={onClose} activeOpacity={1}>
        <View style={styles.tooltipBox}>
          <Text style={styles.tooltipText}>{text}</Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export function InvestmentList({ type }: { type: 'open' | 'closed' }) {
  const { openPositions, closedPositions, closeInvestment, editInvestmentAmount, deleteInvestment } = useInvestments();
  const data = type === 'open' ? openPositions : closedPositions;
  const [selected, setSelected] = useState<Investment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [history, setHistory] = useState<{ date: string; rate: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [tooltip, setTooltip] = useState<null | keyof typeof FIELD_TOOLTIPS>(null);
  const [editMode, setEditMode] = useState(false);
  const [editAmount, setEditAmount] = useState('');

  async function handleDeleteInvestment(id: string) {
    Alert.alert('Delete Investment', 'Are you sure you want to delete this investment?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteInvestment(id);
        setModalVisible(false);
      }},
    ]);
  }

  async function handleEditInvestmentAmount(id: string, newAmount: number) {
    await editInvestmentAmount(id, newAmount);
    setEditMode(false);
    setModalVisible(false);
  }

  const handleClose = async (id: string, pair: string) => {
    const [base, target] = pair.split('/');
    const rate = await fetchForexRatePair(base, target);
    await closeInvestment(id, rate);
  };

  const handlePress = async (item: Investment) => {
    setSelected(item);
    setModalVisible(true);
    setLoading(true);
    const [base, target] = item.pair.split('/');
    const hist = await fetchHistoricalRates(base, target, 7);
    setHistory(hist);
    setLoading(false);
  };

  if (data.length === 0) {
    return <Text style={styles.empty}>No {type} positions.</Text>;
  }

  function getProfit(inv: Investment) {
    if (!inv.closed || inv.closedRate === undefined) return 0;
    return (inv.closedRate - inv.investedRate) * inv.amount;
  }

  return (
    <>
      <FlatList
        data={data}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handlePress(item)}>
            <View style={styles.card}>
              <Text style={styles.pair}>{item.pair}</Text>
              <View style={styles.rowWithIcon}>
                <Text>Amount: {item.amount}</Text>
                <TouchableOpacity onPress={() => setTooltip('amount')}>
                  <Feather name="info" size={15} color="#888" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
              <View style={styles.rowWithIcon}>
                <Text>Invested Rate: {item.investedRate}</Text>
                <TouchableOpacity onPress={() => setTooltip('investedRate')}>
                  <Feather name="info" size={15} color="#888" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>
              <Text>Date: {new Date(item.date).toLocaleString()}</Text>
              {type === 'closed' && item.closedRate && (
                <View style={styles.rowWithIcon}>
                  <Text>Closed Rate: {item.closedRate}</Text>
                  <TouchableOpacity onPress={() => setTooltip('closedRate')}>
                    <Feather name="info" size={15} color="#888" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              )}
              {type === 'closed' && item.closedDate && (
                <Text>Closed Date: {new Date(item.closedDate).toLocaleString()}</Text>
              )}
              {type === 'closed' && item.closedRate && (
                <View style={styles.rowWithIcon}>
                  <View style={[styles.profitBadge, { backgroundColor: getProfit(item) >= 0 ? '#43e97b22' : '#fa709a22' }] }>
                    <Text style={{ color: getProfit(item) >= 0 ? '#43e97b' : '#fa709a', fontWeight: 'bold' }}>
                      {getProfit(item) >= 0 ? 'Profit: ' : 'Loss: '}{getProfit(item).toFixed(2)}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setTooltip('profit')}>
                    <Feather name="info" size={15} color="#888" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
              )}
              {type === 'open' && (
                <Button title="Close Position" onPress={() => handleClose(item.id, item.pair)} />
              )}
            </View>
          </TouchableOpacity>
        )}
      />
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selected && (
              <>
                <Text style={styles.modalTitle}>Investment Details</Text>
                <Text>Pair: {selected.pair}</Text>
                <View style={styles.rowWithIcon}>
                  <Text>Amount: </Text>
                  {editMode ? (
                    <TextInput
                      style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 4, width: 80, marginRight: 8 }}
                      keyboardType="numeric"
                      value={editAmount}
                      onChangeText={setEditAmount}
                    />
                  ) : (
                    <Text>{selected.amount}</Text>
                  )}
                  <TouchableOpacity onPress={() => setTooltip('amount')}>
                    <Feather name="info" size={15} color="#888" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
                {type === 'open' && !editMode && (
                  <Button title="Edit Amount" onPress={() => { setEditMode(true); setEditAmount(String(selected.amount)); }} />
                )}
                {type === 'open' && editMode && (
                  <Button title="Save" onPress={() => handleEditInvestmentAmount(selected.id, Number(editAmount))} />
                )}
                <View style={styles.rowWithIcon}>
                  <Text>Invested Rate: {selected.investedRate}</Text>
                  <TouchableOpacity onPress={() => setTooltip('investedRate')}>
                    <Feather name="info" size={15} color="#888" style={{ marginLeft: 4 }} />
                  </TouchableOpacity>
                </View>
                <Text>Date: {new Date(selected.date).toLocaleString()}</Text>
                {selected.closed && selected.closedRate && (
                  <View style={styles.rowWithIcon}>
                    <Text>Closed Rate: {selected.closedRate}</Text>
                    <TouchableOpacity onPress={() => setTooltip('closedRate')}>
                      <Feather name="info" size={15} color="#888" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  </View>
                )}
                {selected.closed && selected.closedDate && (
                  <Text>Closed Date: {new Date(selected.closedDate!).toLocaleString()}</Text>
                )}
                {selected.closed && selected.closedRate && (
                  <View style={styles.rowWithIcon}>
                    <View style={[styles.profitBadge, { backgroundColor: getProfit(selected) >= 0 ? '#43e97b22' : '#fa709a22' }] }>
                      <Text style={{ color: getProfit(selected) >= 0 ? '#43e97b' : '#fa709a', fontWeight: 'bold' }}>
                        {getProfit(selected) >= 0 ? 'Profit: ' : 'Loss: '}{getProfit(selected).toFixed(2)}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setTooltip('profit')}>
                      <Feather name="info" size={15} color="#888" style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  </View>
                )}
                {loading ? (
                  <Text>Loading chart...</Text>
                ) : (
                  history.length > 0 && (
                    <LineChart
                      data={{
                        labels: history.map(d => d.date.slice(5)),
                        datasets: [{ data: history.map(d => d.rate) }],
                      }}
                      width={Dimensions.get('window').width - 64}
                      height={160}
                      yAxisSuffix=""
                      chartConfig={{
                        backgroundColor: '#fff',
                        backgroundGradientFrom: '#fff',
                        backgroundGradientTo: '#fff',
                        decimalPlaces: 2,
                        color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                      }}
                      bezier
                      style={{ borderRadius: 8, marginVertical: 8 }}
                    />
                  )
                )}
                <Button title="Delete" color="#fa709a" onPress={() => handleDeleteInvestment(selected.id)} />
                <Button title="Close" onPress={() => setModalVisible(false)} />
              </>
            )}
          </View>
        </View>
      </Modal>
      <Tooltip
        visible={!!tooltip}
        onClose={() => setTooltip(null)}
        text={tooltip ? FIELD_TOOLTIPS[tooltip] : ''}
      />
    </>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', margin: 8, padding: 12, borderRadius: 8, elevation: 2 },
  pair: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  empty: { textAlign: 'center', margin: 16, color: '#888' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: 24, borderRadius: 12, width: '85%', alignItems: 'center' },
  modalTitle: { fontWeight: 'bold', fontSize: 20, marginBottom: 12 },
  rowWithIcon: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  profitBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 2, marginRight: 4 },
  tooltipOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  tooltipBox: { backgroundColor: '#fff', padding: 16, borderRadius: 10, maxWidth: 260, elevation: 4 },
  tooltipText: { color: '#222', fontSize: 15, textAlign: 'center' },
}); 