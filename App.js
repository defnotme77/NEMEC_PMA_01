import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function App() {

  const [pocet, setPocet] = useState(0);

  const pridat = () => {
    setPocet(pocet + 1);
  };

  const odober = () => {
    if (pocet > 0) {
      setPocet(pocet - 1);
    }
  };

  const vynulovat = () => {
    setPocet(0);
  };

  const jeLimit = pocet >= 5;
  const jeNula = pocet === 0;

  return (
    <View style={styles.container}>

      <Text style={styles.nadpis}>Počítadlo objednávok</Text>

      <Text style={[styles.cislo, jeLimit && styles.cisloLimitne]}>
        {pocet}
      </Text>

      {jeLimit && (
        <Text style={styles.limitText}>Dosiahnutý limit</Text>
      )}

      <View style={styles.riadok}>

        <TouchableOpacity
          style={[styles.tlacidlo, jeNula && styles.tlacidloNeaktivne]}
          onPress={odober}
          disabled={jeNula}
        >
          <Text style={styles.tlacidloText}>−</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tlacidlo} onPress={pridat}>
          <Text style={styles.tlacidloText}>+</Text>
        </TouchableOpacity>

      </View>

      <TouchableOpacity style={styles.vynulovatBtn} onPress={vynulovat}>
        <Text style={styles.vynulovatText}>Vynulovať</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  nadpis: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },

  cislo: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#000',
  },

  cisloLimitne: {
    color: 'red',
  },

  limitText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },

  riadok: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 16,
  },

  tlacidlo: {
    backgroundColor: '#3B82F6',
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tlacidloNeaktivne: {
    backgroundColor: '#aaa',
  },

  tlacidloText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },

  vynulovatBtn: {
    marginTop: 16,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 12,
  },

  vynulovatText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
