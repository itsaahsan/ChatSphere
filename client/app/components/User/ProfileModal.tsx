'use client';

import { useState, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import { userAPI } from '@/lib/api';
import { FiX, FiCamera } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onUpdate: () => void;
}

export default function ProfileModal({ isOpen, onClose, user, onUpdate }: ProfileModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [about, setAbout] = useState(user?.about || '');
  const [pic, setPic] = useState(user?.pic || '');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPic(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await userAPI.updateProfile({
        name,
        about,
        pic,
      });
      toast.success('Profile updated successfully');
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-darker border border-gray-700 rounded-lg w-full max-w-md p-6 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-green-500">Profile</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-800 rounded">
            <FiX size={24} />
          </button>
        </div>

        {/* Profile Picture */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-24 h-24 mb-4">
            {pic ? (
              <img src={pic} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center text-2xl">
                👤
              </div>
            )}
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-2 bg-green-600 rounded-full hover:bg-green-700 transition"
              >
                <FiCamera size={16} />
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* Profile Info */}
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold mb-2">Name</label>
            {isEditing ? (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none"
              />
            ) : (
              <p className="text-gray-300">{user?.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-2">Email</label>
            <p className="text-gray-300">{user?.email}</p>
          </div>

          {/* About */}
          <div>
            <label className="block text-sm font-semibold mb-2">About</label>
            {isEditing ? (
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:border-green-500 focus:outline-none resize-none"
                rows={3}
              />
            ) : (
              <p className="text-gray-300">{user?.about || 'No about text'}</p>
            )}
          </div>

          {/* Online Status */}
          <div>
            <label className="block text-sm font-semibold mb-2">Status</label>
            <p className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  user?.isOnline ? 'bg-green-500' : 'bg-gray-500'
                }`}
              />
              <span className="text-gray-300">{user?.isOnline ? 'Online' : 'Offline'}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setName(user?.name);
                  setAbout(user?.about);
                  setPic(user?.pic);
                }}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="w-full btn-primary">
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
