import mongoose, { Schema, Document } from 'mongoose';

export interface IFamilyMember extends Document {
  _id: string;
  namaLengkap: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  tanggalLahir?: Date;
  tanggalWafat?: Date;
  tempatLahir?: string;
  pekerjaan?: string;
  bio?: string;
  fotoProfil?: string;
  idAyah?: string;
  idIbu?: string;
  idPasangan?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FamilyMemberSchema: Schema = new Schema({
  namaLengkap: {
    type: String,
    required: true,
    trim: true
  },
  jenisKelamin: {
    type: String,
    required: true,
    enum: ['Laki-laki', 'Perempuan']
  },
  tanggalLahir: {
    type: Date,
    default: null
  },
  tanggalWafat: {
    type: Date,
    default: null
  },
  tempatLahir: {
    type: String,
    trim: true,
    default: ''
  },
  pekerjaan: {
    type: String,
    trim: true,
    default: ''
  },
  bio: {
    type: String,
    trim: true,
    default: ''
  },
  fotoProfil: {
    type: String,
    default: ''
  },
  idAyah: {
    type: Schema.Types.ObjectId,
    ref: 'FamilyMember',
    default: null
  },
  idIbu: {
    type: Schema.Types.ObjectId,
    ref: 'FamilyMember',
    default: null
  },
  idPasangan: {
    type: Schema.Types.ObjectId,
    ref: 'FamilyMember',
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.models.FamilyMember || mongoose.model<IFamilyMember>('FamilyMember', FamilyMemberSchema);