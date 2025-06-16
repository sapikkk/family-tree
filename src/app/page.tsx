'use client';

import { useState, useEffect } from 'react';
import { FamilyMember } from '@/types';
import FamilyTree from '@/components/FamilyTree';
import MemberList from '@/components/MemberList';
import MemberModal from '@/components/MemberModal';
import DetailCard from '@/components/DetailCard';
import ConfirmModal from '@/components/ConfirmModal';
import { Plus, Users, GitBranch } from 'lucide-react';

export default function Home() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; member: FamilyMember | null }>({
    show: false,
    member: null
  });
  const [activeTab, setActiveTab] = useState<'tree' | 'list'>('tree');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/family-members');
      const result = await response.json();
      if (result.success) {
        setMembers(result.data);
      }
    } catch (error) {
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = () => {
    setEditingMember(null);
    setIsModalOpen(true);
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setIsModalOpen(true);
  };

  const handleDeleteMember = (member: FamilyMember) => {
    setDeleteConfirm({ show: true, member });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.member) return;

    try {
      const response = await fetch(`/api/family-members/${deleteConfirm.member._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMembers();
        setIsDetailOpen(false);
        setSelectedMember(null);
      }
    } catch (error) {
      console.error('Error deleting member:', error);
    }

    setDeleteConfirm({ show: false, member: null });
  };

  const handleMemberClick = (member: FamilyMember) => {
    setSelectedMember(member);
    setIsDetailOpen(true);
  };

  const handleModalSave = () => {
    fetchMembers();
    setIsModalOpen(false);
    setEditingMember(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data keluarga...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Silsilah Keluarga</h1>
            </div>
            <button
              onClick={handleAddMember}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Anggota
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('tree')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'tree'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <GitBranch className="h-4 w-4" />
              <span>Pohon Keluarga</span>
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Daftar Anggota</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="w-screen mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'tree' ? (
          <FamilyTree members={members} onMemberClick={handleMemberClick} />
        ) : (
          <MemberList
            members={members}
            onEdit={handleEditMember}
            onDelete={handleDeleteMember}
            onMemberClick={handleMemberClick}
          />
        )}
      </main>

      {/* Modals */}
      {isModalOpen && (
        <MemberModal
          member={editingMember}
          members={members}
          onSave={handleModalSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {isDetailOpen && selectedMember && (
        <DetailCard
          member={selectedMember}
          members={members}
          onEdit={handleEditMember}
          onDelete={handleDeleteMember}
          onClose={() => setIsDetailOpen(false)}
        />
      )}

      {deleteConfirm.show && deleteConfirm.member && (
        <ConfirmModal
          title="Hapus Anggota Keluarga"
          message={`Apakah Anda yakin ingin menghapus ${deleteConfirm.member.namaLengkap}?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm({ show: false, member: null })}
        />
      )}
    </div>
  );
}