import { useMutation, useQuery } from 'convex/react';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { api } from '../../convex/_generated/api';

type Donation = {
  _id: string;
  food: string;
  status: 'pending' | 'taken' | 'expired';
};

export default function Profile() {
  const donations = useQuery(api.donation.getDonations) as
    | Donation[]
    | undefined;

  const user = useQuery(api.user.getUser);
  const setUser = useMutation(api.user.setUser);

  const [name, setName] = useState('');
  const [image, setImage] = useState<string | undefined>();

  const [showEdit, setShowEdit] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempImage, setTempImage] = useState<string | undefined>();

  const [saving, setSaving] = useState(false);

  // 🔥 LOAD DATA
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setImage(user.image);
    }
  }, [user]);

  useEffect(() => {
    setTempName(name);
    setTempImage(image);
  }, [showEdit]);

  if (!donations) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2ECC71" />
      </View>
    );
  }

  // 🔥 STATS
  const total = donations.length;
  const completed = donations.filter(
    (d) => d.status === 'taken'
  ).length;

  const pending = donations.filter(
    (d) => d.status === 'pending'
  ).length;

  // 🔥 BADGE
  let badge = 'New Donor';
  if (total >= 5) badge = 'Active Donor';
  if (total >= 10) badge = 'Food Hero';

  // 🔥 PICK IMAGE
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setTempImage(result.assets[0].uri);
    }
  };

  // 🔥 SAVE PROFILE
  const handleSave = async () => {
    if (!tempName.trim()) return;

    try {
      setSaving(true);

      await setUser({
        name: tempName,
        image: tempImage,
      });

      setName(tempName);
      setImage(tempImage);
      setShowEdit(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        {image ? (
          <Image source={{ uri: image }} style={styles.avatar} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name ? name[0].toUpperCase() : 'U'}
            </Text>
          </View>
        )}

        <Text style={styles.name}>
          {name || 'Nama belum diisi'}
        </Text>

        <Text style={styles.badge}>{badge}</Text>

        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => setShowEdit(true)}
        >
          <Text style={{ color: 'white' }}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* STATS */}
      <View style={styles.statsContainer}>
        <View style={styles.card}>
          <Text style={styles.value}>{total}</Text>
          <Text style={styles.label}>Total</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.value}>{completed}</Text>
          <Text style={styles.label}>Tersalurkan</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.value}>{pending}</Text>
          <Text style={styles.label}>Pending</Text>
        </View>
      </View>

      {/* IMPACT */}
      <View style={styles.impactCard}>
        <Text style={styles.impactText}>
          Kamu membantu {completed * 2} orang 🙌
        </Text>
      </View>

      {/* MODAL EDIT */}
      <Modal visible={showEdit} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Edit Profile</Text>

          <TouchableOpacity onPress={pickImage}>
            {tempImage ? (
              <Image source={{ uri: tempImage }} style={styles.avatarLarge} />
            ) : (
              <View style={styles.avatarLarge}>
                <Text style={{ color: 'white' }}>Pilih Foto</Text>
              </View>
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={tempName}
            onChangeText={setTempName}
            placeholder="Nama"
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Simpan</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowEdit(false)}>
            <Text style={{ marginTop: 10, textAlign: 'center' }}>
              Batal
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

// 🎨 STYLE
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FBF7',
    padding: 16,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },

  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#2ECC71',
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },

  name: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27AE60',
  },

  badge: {
    marginTop: 6,
    backgroundColor: '#2ECC71',
    color: 'white',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
  },

  editBtn: {
    marginTop: 10,
    backgroundColor: '#27AE60',
    padding: 10,
    borderRadius: 10,
  },

  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  card: {
    backgroundColor: 'white',
    flex: 1,
    margin: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },

  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27AE60',
  },

  label: {
    fontSize: 12,
    color: '#7F8C8D',
  },

  impactCard: {
    marginTop: 20,
    backgroundColor: '#2ECC71',
    padding: 16,
    borderRadius: 16,
  },

  impactText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },

  avatarLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#2ECC71',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },

  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  button: {
    backgroundColor: '#2ECC71',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});