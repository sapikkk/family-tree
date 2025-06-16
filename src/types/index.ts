export interface FamilyMember {
  _id: string;
  namaLengkap: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  tanggalLahir?: string;
  tanggalWafat?: string;
  tempatLahir?: string;
  pekerjaan?: string;
  bio?: string;
  fotoProfil?: string;
  idAyah?: string;
  idIbu?: string;
  idPasangan?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TreeNode {
  id: string;
  name: string;
  gender: 'Laki-laki' | 'Perempuan';
  photo?: string;
  spouse?: TreeNode;
  children: TreeNode[];
  parents: {
    father?: TreeNode;
    mother?: TreeNode;
  };
}