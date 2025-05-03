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
import * as Location from 'expo-location';
import { useEffect } from 'react';
import { OPENWEATHER_API_KEY } from '@env';

const apiKey = OPENWEATHER_API_KEY;

interface Item {
  type: string;
  color: string;
  brand: string;
  tags: string[];
}

type Outfit = Item[];

export default function App() {
  const [type, setType] = useState('');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [tags, setTags] = useState('');

  const [closet, setCloset] = useState<Item[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [occasionFilter, setOccasionFilter] = useState('');

  const [weather, setWeather] = useState<{ temp: Number; condition: string } | null>(null);

  const baseUrl = Platform.OS === 'web' || Platform.OS === 'ios'
    ? 'http://127.0.0.1:8000'
    : 'http://10.0.2.2:8000';

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Cannot fetch weather without location');
        return;
      }
      const loc = await Location.getCurrentPositionAsync();
      fetchWeather(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const apiKey = 'YOUR_OPENWEATHERMAP_KEY';
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
      );
      const json = await res.json();
      setWeather({
        temp: json.main.temp,
        condition: json.weather[0].main.toLowerCase(),
      });
    } catch (e: any) {
      console.error('Weather fetch error', e);
    }
  };

  const onSubmit = async () => {
    try {
      const res = await fetch(`${baseUrl}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type, 
          color, 
          brand, 
          tags: tags.split(',').map(t => t.trim()).filter(t => t),
        }),
      });
      const data = await res.json();
      Alert.alert('✅ Success', `${data.item.type} added!`);
      setType(''); setColor(''); setBrand(''); setTags('');
    } catch (e: any) {
      Alert.alert('❌ Error', e.message);
    }
  };

  const loadItems = async () => {
    try {
        const res = await fetch(`${baseUrl}/items`);
        const data: Item[] = await res.json();
        setCloset(data);
    } catch (e: any) {
      Alert.alert('Error loading items', e.message);
    }
  };

  const suggestOutfits = async (occasion = '') => {
    try {
      const url = occasion
        ? `${baseUrl}/outfits?occasion=${encodeURIComponent(occasion)}`
        : `${baseUrl}/outfits`;
      const res = await fetch(url);
      const json = await res.json() as { outfits: Item[][] };
      setOutfits(json.outfits);
    } catch (e: any) {
      Alert.alert('Error fetching outfits', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a wardrobe item</Text>
      <TextInput placeholder="Type (e.g. Hoodie)"
        value={type} onChangeText={setType} style={styles.input} />
      <TextInput placeholder="Color (e.g. Red)"
        value={color} onChangeText={setColor} style={styles.input} />
      <TextInput placeholder="Brand (e.g. Nike)"
        value={brand} onChangeText={setBrand} style={styles.input} />
      <TextInput placeholder="Brand (e.g. work, casual)"
        value={tags} onChangeText={setTags} style={styles.input} />
      <Button title="Add Item" onPress={onSubmit}
        disabled={!type || !color || !brand} />
      
      <View style={{ marginTop: 20   }}>
        <Button title="Show My Closet" onPress={loadItems} />
      </View>
      <ScrollView style={styles.list}>
        {closet.map((it, idx) => (
          <Text key={idx} style={styles.listItem}>
            • {it.type} — {it.color} — {it.brand}
            {it.tags.length ? ` [${it.tags.join(', ')}]` : ''}
          </Text>
        ))}
      </ScrollView>

      <TextInput placeholder="Filter Occasion (e.g. work)"
        value={occasionFilter} onChangeText={setOccasionFilter} style={styles.input} />

      <View style={{ marginTop: 20 }}>
        <Button
          title="Suggest Outfits"
          onPress={() => suggestOutfits(occasionFilter)}
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
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title:     { fontSize: 20, marginBottom: 16, textAlign: 'center' },
  input:     { borderWidth: 1, borderColor: '#ccc', padding: 12, marginBottom: 12, borderRadius: 6 },
  list:      { marginTop: 10, maxHeight: 150 },
  listItem:  { paddingVertical: 4, fontSize: 16 },
  outfitCard:{ marginTop: 16, padding: 12, borderWidth: 1, borderColor: '#444', borderRadius: 6 },
  outfitTitle:{ fontWeight: 'bold', marginBottom: 6, fontSize: 16 },
});