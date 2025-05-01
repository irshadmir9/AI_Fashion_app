import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';

interface Item {
  type: string;
  color: string;
  brand: string;
}

type Outfit = Item[];

export default function App() {
  const [type, setType] = useState('');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');

  const [closet, setCloset] = useState<Item[]>([]);

  const [outfits, setOutfits] = useState<Outfit[]>([]);

  const onSubmit = async () => {
    const baseUrl = 
      Platform.OS === 'web'
        ? 'http://127.0.0.1:8000'
        : Platform.OS === 'ios'
        ? 'http://127.0.0.1:8000'
        : 'http://10.0.2.2:8000';

    try {
      console.log('Submitting item:', { type, color, brand });
      const res = await fetch(`${baseUrl}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, color, brand }),
      });
      console.log('Raw response:', res);
      const data = await res.json();
      console.log('Parsed JSON:', data);
      Alert.alert('✅ Success', `${data.item.type} added!`);
      setType(''); setColor(''); setBrand('');
    } catch (e: any) {
      Alert.alert('❌ Error', e.message);
    }
  };

  const loadItems = async () => {
    try {
      const baseUrl =
        Platform.OS ==='web'
          ? 'http://127.0.0.1:8000'
          : Platform.OS === 'ios'
          ? 'http://127.0.0.1:8000'
          : 'http://10.0.2.2:8000'; 

        const res = await fetch(`${baseUrl}/items`);
        const data: Item[] = await res.json();
        setCloset(data);
    } catch (e: any) {
      Alert.alert('Error loading items', e.message);
    }
  };

  const suggestOutfits = async () => {
    try {
      const baseUrl = 
      Platform.OS === 'web'
          ? 'http://127.0.0.1:8000'
          : Platform.OS === 'ios'
          ? 'http://127.0.0.1:8000'
          : 'http://10.0.2.2:8000';

      const res = await fetch(`${baseUrl}/outfits`);
      const json = await res.json() as { outfits: Outfit[] };
      setOutfits(json.outfits);
    } catch (e: any) {
      Alert.alert('Error fetching outfits', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a wardrobe item</Text>
      <TextInput
        placeholder="Type (e.g. Hoodie)"
        value={type}
        onChangeText={setType}
        style={styles.input}
      />
      <TextInput
        placeholder="Color (e.g. Red)"
        value={color}
        onChangeText={setColor}
        style={styles.input}
      />
      <TextInput
        placeholder="Brand (e.g. Nike)"
        value={brand}
        onChangeText={setBrand}
        style={styles.input}
      />
      <Button
        title="Add Item"
        onPress={onSubmit}
        disabled={!type || !color || !brand}
      />
      
      <View style={{ marginTop: 20 }}>
        <Button 
          title="Show My Closet"
          onPress={loadItems}
        />
      </View>
      <ScrollView style={styles.list}>
        {closet.map((it, idx) => (
          <Text key={idx} style={styles.listItem}>
            • {it.type} — {it.color} — {it.brand}
          </Text>
        ))}
      </ScrollView>

      <View style={{ marginTop: 20 }}>
        <Button
          title="Suggest Outfits"
          onPress={suggestOutfits}
        />
      </View>
      <ScrollView style={styles.list}>
        {outfits.map((of, i) => (
          <View key={i} style={styles.outfitCard}>
            <Text style={styles.outfitTitle}>Outfit {i + 1}</Text>
            {of.map((it, j) => (
              <Text key={j} style={styles.listItem}>
                • {it.type} ({it.color}, {it.brand})
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  title: { 
    fontSize: 20, 
    marginBottom: 16, 
    textAlign: 'center' 
  },
  input: {
    borderWidth: 1, borderColor: '#ccc',
    padding: 12, marginBottom: 12,
    borderRadius: 6
  },
  list: {
    marginTop: 10,
    maxHeight: 150,         // optional: limit height
  },
  listItem: {
    paddingVertical: 4,
    fontSize: 16,
  },
  outfitCard: {
    marginTop: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 6,
  },
  outfitTitle: {
    fontWeight: 'bold',
    marginBottom: 6,
    fontSize: 16,
  },
});