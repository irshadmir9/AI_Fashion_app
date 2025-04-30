import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  Platform,

} from 'react-native';

export default function App() {
  const [type, setType] = useState('');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');

  const onSubmit = async () => {
    const baseUrl = 'http://172.26.224.1:8000';

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a wardrobe item</Text>
      <TextInput
        placeholder="Type (e.g. hoodie)"
        value={type}
        onChangeText={setType}
        style={styles.input}
      />
      <TextInput
        placeholder="Color (e.g. red)"
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff'
  },
  title: { fontSize: 20, marginBottom: 16, textAlign: 'center' },
  input: {
    borderWidth: 1, borderColor: '#ccc',
    padding: 12, marginBottom: 12,
    borderRadius: 6
  },
  
});