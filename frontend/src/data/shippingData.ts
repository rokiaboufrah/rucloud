export interface WilayaShipping {
  code: number
  name: string
  domicile: number
  stopDesk: number
}

export const wilayaShippingData: WilayaShipping[] = [
  { code: 1, name: 'Adrar', domicile: 1100, stopDesk: 600 },
  { code: 2, name: 'Chlef', domicile: 700, stopDesk: 400 },
  { code: 3, name: 'Laghouat', domicile: 900, stopDesk: 500 },
  { code: 4, name: 'Oum El Bouaghi', domicile: 650, stopDesk: 400 },
  { code: 5, name: 'Batna', domicile: 700, stopDesk: 400 },
  { code: 6, name: 'Béjaïa', domicile: 700, stopDesk: 400 },
  { code: 7, name: 'Biskra', domicile: 900, stopDesk: 500 },
  { code: 8, name: 'Béchar', domicile: 1100, stopDesk: 600 },
  { code: 9, name: 'Blida', domicile: 500, stopDesk: 250 },
  { code: 10, name: 'Bouira', domicile: 700, stopDesk: 400 },
  { code: 11, name: 'Tamanrasset', domicile: 1300, stopDesk: 600 },
  { code: 12, name: 'Tébessa', domicile: 700, stopDesk: 400 },
  { code: 13, name: 'Tlemcen', domicile: 800, stopDesk: 400 },
  { code: 14, name: 'Tiaret', domicile: 800, stopDesk: 400 },
  { code: 15, name: 'Tizi Ouzou', domicile: 700, stopDesk: 400 },
  { code: 16, name: 'Alger', domicile: 500, stopDesk: 250 },
  { code: 17, name: 'Djelfa', domicile: 900, stopDesk: 500 },
  { code: 18, name: 'Jijel', domicile: 600, stopDesk: 400 },
  { code: 19, name: 'Sétif', domicile: 700, stopDesk: 400 },
  { code: 20, name: 'Saïda', domicile: 800, stopDesk: 400 },
  { code: 21, name: 'Skikda', domicile: 600, stopDesk: 400 },
  { code: 22, name: 'Sidi Bel Abbès', domicile: 700, stopDesk: 400 },
  { code: 23, name: 'Annaba', domicile: 700, stopDesk: 400 },
  { code: 24, name: 'Guelma', domicile: 600, stopDesk: 400 },
  { code: 25, name: 'Constantine', domicile: 500, stopDesk: 400 },
  { code: 26, name: 'Médéa', domicile: 700, stopDesk: 400 },
  { code: 27, name: 'Mostaganem', domicile: 700, stopDesk: 400 },
  { code: 28, name: "M'Sila", domicile: 800, stopDesk: 500 },
  { code: 29, name: 'Mascara', domicile: 700, stopDesk: 400 },
  { code: 30, name: 'Ouargla', domicile: 900, stopDesk: 500 },
  { code: 31, name: 'Oran', domicile: 800, stopDesk: 400 },
  { code: 32, name: 'El Bayadh', domicile: 800, stopDesk: 500 },
  { code: 33, name: 'Illizi', domicile: 1300, stopDesk: 600 },
  { code: 34, name: 'Bordj Bou Arreridj', domicile: 700, stopDesk: 400 },
  { code: 35, name: 'Boumerdès', domicile: 700, stopDesk: 400 },
  { code: 36, name: 'El Tarf', domicile: 700, stopDesk: 400 },
  { code: 37, name: 'Tindouf', domicile: 1300, stopDesk: 550 },
  { code: 38, name: 'Tissemsilt', domicile: 800, stopDesk: 400 },
  { code: 39, name: 'El Oued', domicile: 900, stopDesk: 500 },
  { code: 40, name: 'Khenchela', domicile: 700, stopDesk: 500 },
  { code: 41, name: 'Souk Ahras', domicile: 700, stopDesk: 500 },
  { code: 42, name: 'Tipaza', domicile: 700, stopDesk: 400 },
  { code: 43, name: 'Mila', domicile: 600, stopDesk: 400 },
  { code: 44, name: 'Aïn Defla', domicile: 700, stopDesk: 400 },
  { code: 45, name: 'Naâma', domicile: 800, stopDesk: 500 },
  { code: 46, name: 'Aïn Témouchent', domicile: 800, stopDesk: 400 },
  { code: 47, name: 'Ghardaïa', domicile: 1000, stopDesk: 500 },
  { code: 48, name: 'Relizane', domicile: 700, stopDesk: 400 },
  { code: 49, name: 'Timimoun', domicile: 1100, stopDesk: 600 },
  { code: 51, name: 'Ouled Djellal', domicile: 900, stopDesk: 500 },
  { code: 52, name: 'Beni Abbes', domicile: 1100, stopDesk: 0 },
  { code: 53, name: 'In Salah', domicile: 1300, stopDesk: 600 },
  { code: 55, name: 'Touggourt', domicile: 900, stopDesk: 500 },
  { code: 57, name: "El M'Ghair", domicile: 900, stopDesk: 0 },
  { code: 58, name: 'El Meniaa', domicile: 1100, stopDesk: 450 },
]

export function getShippingCost(wilayaCode: number, deliveryType: 'domicile' | 'stop_desk'): number {
  const wilaya = wilayaShippingData.find(w => w.code === wilayaCode)
  if (!wilaya) return 0
  return deliveryType === 'domicile' ? wilaya.domicile : wilaya.stopDesk
}

export function getWilayaName(code: number): string {
  const wilaya = wilayaShippingData.find(w => w.code === code)
  return wilaya ? wilaya.name : ''
}
