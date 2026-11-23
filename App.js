import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button } from '@react-navigation/elements';

// ─── Auth context ─────────────────────────────────────────────────────────────
const AuthContext = React.createContext(null);

// ─── Navigator (module-level) ─────────────────────────────────────────────────
const Stack = createNativeStackNavigator();

// ─── Root stack ───────────────────────────────────────────────────────────────
function RootStack({ isSignedIn }) {
  return (
    <Stack.Navigator
      initialRouteName="SignIn"
      screenOptions={{ headerTitleAlign: 'center' }}
    >
      {isSignedIn ? (
        <>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: 'Domov' }}
          />
          <Stack.Screen
            name="Counter"
            component={CounterScreen}
            options={{ title: 'Počítadlo' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="SignIn"
            component={SignInScreen}
            options={{ title: 'Prihlásenie' }}
          />
          <Stack.Screen
            name="SignUp"
            component={SignUpScreen}
            options={{ title: 'Registrácia' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

// ─── Screens ──────────────────────────────────────────────────────────────────
function SignInScreen() {
  const navigation = useNavigation();
  const { signIn } = React.useContext(AuthContext);
  return (
    <View style={{ flex: 1, backgroundColor: 'tomato',
        alignItems: 'center', justifyContent: 'center' }}>
      <Button onPress={signIn}>Prihlásiť sa</Button>
      <Button onPress={() => navigation.navigate('SignUp')}>
        Nemám účet
      </Button>
    </View>
  );
}

function SignUpScreen() {
  const navigation = useNavigation();
  return (
    <View style={{ flex: 1, backgroundColor: 'skyblue',
        alignItems: 'center', justifyContent: 'center' }}>
      <Button onPress={() => navigation.goBack()}>Späť</Button>
      <Button onPress={() => navigation.popToTop()}>Na začiatok</Button>
    </View>
  );
}

function HomeScreen() {
  const navigation = useNavigation();
  const { signOut } = React.useContext(AuthContext);
  return (
    <View style={{ flex: 1, backgroundColor: '#eee',
        alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontSize: 24, marginBottom: 20 }}>Home</Text>
      <Button onPress={() => navigation.navigate('Counter')}>
        Počítadlo objednávok
      </Button>
      <Button onPress={signOut}>Odhlásiť sa</Button>
    </View>
  );
}

function CounterScreen() {
  const [pocet, setPocet] = useState(0);

  const pridat = () => setPocet(pocet + 1);
  const odober = () => { if (pocet > 0) setPocet(pocet - 1); };
  const vynulovat = () => setPocet(0);

  const jeLimit = pocet >= 5;
  const jeNula  = pocet === 0;

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

        <TouchableOpacity
          style={[styles.tlacidlo, jeLimit && styles.tlacidloNeaktivne]}
          onPress={pridat}
          disabled={jeLimit}
        >
          <Text style={styles.tlacidloText}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.vynulovatBtn} onPress={vynulovat}>
        <Text style={styles.vynulovatText}>Vynulovať</Text>
      </TouchableOpacity>

    </View>
  );
}

// ─── App (single export) ──────────────────────────────────────────────────────
export default function App() {
  const [isSignedIn, setIsSignedIn] = React.useState(false);

  const auth = {
    signIn:  () => setIsSignedIn(true),
    signOut: () => setIsSignedIn(false),
  };

  return (
    <AuthContext.Provider value={auth}>
      <NavigationContainer>
        <RootStack isSignedIn={isSignedIn} />
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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
