import AsyncStorage from "@react-native-async-storage/async-storage";

export async function getItem(item: string) {
  const value = await AsyncStorage.getItem(item);
  return value ? JSON.parse(value) : null;
}

export async function setItem(item:string,value: any) {
  return AsyncStorage.setItem(item, JSON.stringify(value));
}

export async function removeItem(item: string) {
  return AsyncStorage.removeItem(item);
}
