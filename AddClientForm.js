import React, { useState } from 'react';
import { Text, View, TextInput, Button } from 'react-native'; // Импортируем необходимые компоненты
import axios from 'axios';

function AddClientForm() {
  const [full_name, setFullName] = useState('');
  const [phone_number, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [source, setSource] = useState('');
  const [comment, setComment] = useState('');

  const handleAddClient = async () => {
    try {
      await axios.post('http://dens04.beget.tech/add-client', {
        full_name,
        phone_number,
        email,
        address,
        source,
        comment,
      });
      // После успешной отправки данных, сбросьте состояние полей формы
      setFullName('');
      setPhoneNumber('');
      setEmail('');
      setAddress('');
      setSource('');
      setComment('');
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  return (
    <View>
      <Text>Add Client</Text>
      <TextInput
        placeholder="Full Name"
        value={full_name}
        onChangeText={(text) => setFullName(text)}
      />
      <TextInput
        placeholder="Phone Number"
        value={phone_number}
        onChangeText={(text) => setPhoneNumber(text)}
      />
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
      />
      <TextInput
        placeholder="Address"
        value={address}
        onChangeText={(text) => setAddress(text)}
      />
      <TextInput
        placeholder="Source"
        value={source}
        onChangeText={(text) => setSource(text)}
      />
      <TextInput
        placeholder="Comment"
        value={comment}
        onChangeText={(text) => setComment(text)}
      />
      <Button title="Add Client" onPress={handleAddClient} />
    </View>
  );
}

export default AddClientForm;
