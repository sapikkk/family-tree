'use client';

import { useState, useMemo } from 'react';
import { FamilyMember } from '@/types';
import { Search, Edit, Trash2, User } from 'lucide-react';

interface MemberListProps {
  members: FamilyMember[];
  onEdit: (member: FamilyMember) => void;
  onDelete: (member: FamilyMember) => void;
  onMemberClick: (member: FamilyMember) => void;
}

export default function MemberList({ members, onEdit, onDelete, onMemberClick }: MemberListProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = useMemo(() => {
    return members.filter(member =>
      member.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [members, searchTerm]);

  const getParentName = (member: FamilyMember, parentType: 'father' | 'mother') => {
    const parentId = parentType === 'father' ? member.idAyah : member.idIbu;
    if (!parentId) return '-';
    
    const parent = members.find(m => m._id === parentId);
    return parent ? parent.namaLengkap : '-';
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header with Search */}
      <div className="p-6 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Daftar Anggota Keluarga</h2>
          <div className="text-sm text-gray-600">
            Total: {filteredMembers.length} anggota
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari anggota keluarga..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Anggota
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jenis Kelamin
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal Lahir
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Orang Tua
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMembers.map((member) => (
              <tr key={member._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div 
                    className="flex items-center cursor-pointer"
                    onClick={() => onMemberClick(member)}
                  >
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                        member.jenisKelamin === 'Laki-laki' ? 'bg-blue-500' : 'bg-pink-500'
                      }`}>
                        {member.fotoProfil ? (
                          <img 
                            src={member.fotoProfil} 
                            alt={member.namaLengkap}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5" />
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 hover:text-blue-600">
                        {member.namaLengkap}
                      </div>
                      {member.pekerjaan && (
                        <div className="text-sm text-gray-500">{member.pekerjaan}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    member.jenisKelamin === 'Laki-laki' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-pink-100 text-pink-800'
                  }`}>
                    {member.jenisKelamin}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {member.tanggalLahir 
                    ? new Date(member.tanggalLahir).toLocaleDateString('id-ID')
                    : '-'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div>Ayah: {getParentName(member, 'father')}</div>
                    <div>Ibu: {getParentName(member, 'mother')}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onEdit(member)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-100 rounded"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(member)}
                      className="text-red-600 hover:text-red-900 p-1 hover:bg-red-100 rounded"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            {searchTerm ? 'Tidak ada hasil pencarian' : 'Belum ada anggota keluarga'}
          </h3>
          <p className="text-sm text-gray-500">
            {searchTerm 
              ? `Tidak ditemukan anggota dengan nama "${searchTerm}"`
              : 'Tambahkan anggota keluarga pertama untuk memulai'
            }
          </p>
        </div>
      )}
    </div>
  );
}