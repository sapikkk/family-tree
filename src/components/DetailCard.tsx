'use client';

import { FamilyMember } from '@/types';
import { X, Edit, Trash2, User, Calendar, MapPin, Briefcase, Heart } from 'lucide-react';

interface DetailCardProps {
  member: FamilyMember;
  members: FamilyMember[];
  onEdit: (member: FamilyMember) => void;
  onDelete: (member: FamilyMember) => void;
  onClose: () => void;
}

export default function DetailCard({ member, members, onEdit, onDelete, onClose }: DetailCardProps) {
  const getRelatedMember = (id: string | undefined) => {
    if (!id) return null;
    return members.find(m => m._id === id);
  };

  const father = getRelatedMember(member.idAyah);
  const mother = getRelatedMember(member.idIbu);
  const spouse = getRelatedMember(member.idPasangan);
  
  const children = members.filter(m => 
    m.idAyah === member._id || m.idIbu === member._id
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const calculateAge = () => {
    if (!member.tanggalLahir) return null;
    
    const birthDate = new Date(member.tanggalLahir);
    const endDate = member.tanggalWafat ? new Date(member.tanggalWafat) : new Date();
    
    let age = endDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = endDate.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center space-x-4">
            <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center text-white font-bold text-lg ${
              member.jenisKelamin === 'Laki-laki' ? 'bg-blue-500 border-blue-600' : 'bg-pink-500 border-pink-600'
            }`}>
              {member.fotoProfil ? (
                <img 
                  src={member.fotoProfil} 
                  alt={member.namaLengkap}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <User className="h-8 w-8" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{member.namaLengkap}</h2>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                member.jenisKelamin === 'Laki-laki' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-pink-100 text-pink-800'
              }`}>
                {member.jenisKelamin}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(member)}
              className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-full"
              title="Edit"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(member)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-full"
              title="Hapus"
            >
              <Trash2 className="h-5 w-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:bg-gray-100 rounded-full"
              title="Tutup"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Informasi Pribadi</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {member.tanggalLahir && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Lahir: {formatDate(member.tanggalLahir)}</span>
                  {calculateAge() !== null && (
                    <span className="text-gray-500">({calculateAge()} tahun)</span>
                  )}
                </div>
              )}
              
              {member.tanggalWafat && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Wafat: {formatDate(member.tanggalWafat)}</span>
                </div>
              )}
              
              {member.tempatLahir && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{member.tempatLahir}</span>
                </div>
              )}
              
              {member.pekerjaan && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Briefcase className="h-4 w-4" />
                  <span>{member.pekerjaan}</span>
                </div>
              )}
            </div>
          </div>

          {/* Biography */}
          {member.bio && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Biografi</h3>
              <p className="text-gray-700 leading-relaxed">{member.bio}</p>
            </div>
          )}

          {/* Family Relations */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Hubungan Keluarga</h3>
            
            {/* Parents */}
            {(father || mother) && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Orang Tua</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {father && (
                    <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Ayah: {father.namaLengkap}</span>
                    </div>
                  )}
                  {mother && (
                    <div className="flex items-center space-x-2 p-2 bg-pink-50 rounded">
                      <User className="h-4 w-4 text-pink-600" />
                      <span className="text-sm">Ibu: {mother.namaLengkap}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Spouse */}
            {spouse && (
              <div className="mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Pasangan</h4>
                <div className="flex items-center space-x-2 p-2 bg-red-50 rounded">
                  <Heart className="h-4 w-4 text-red-600" />
                  <span className="text-sm">{spouse.namaLengkap}</span>
                </div>
              </div>
            )}

            {/* Children */}
            {children.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Anak ({children.length})</h4>
                <div className="space-y-2">
                  {children.map(child => (
                    <div key={child._id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                      <User className={`h-4 w-4 ${child.jenisKelamin === 'Laki-laki' ? 'text-blue-600' : 'text-pink-600'}`} />
                      <span className="text-sm">{child.namaLengkap}</span>
                      {child.tanggalLahir && (
                        <span className="text-xs text-gray-500">
                          ({new Date(child.tanggalLahir).getFullYear()})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Relations */}
            {!father && !mother && !spouse && children.length === 0 && (
              <p className="text-gray-500 text-sm">Belum ada hubungan keluarga yang tercatat</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}