"use client";

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {useFormatter, useTranslations} from 'next-intl';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { authApi, mediaApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { PageLoader } from '@/components/LoadingSpinner';

const extractErrorDetail = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null) {
    const response = (error as { response?: { data?: { detail?: unknown } } }).response;
    const detail = response?.data?.detail;
    if (typeof detail === 'string' && detail.trim().length > 0) {
      return detail;
    }
  }
  return fallback;
};

export default function ProfilePage() {
  const {
    user,
    isAuthenticated,
    isInitialized,
    pointBalance,
    setUser,
  } = useAuthStore();
  const t = useTranslations('profile.page');
  const validationT = useTranslations('profile.validation');
  const errorsT = useTranslations('profile.errors');
  const messagesT = useTranslations('profile.messages');
  const buttonsT = useTranslations('profile.buttons');
  const fieldsT = useTranslations('profile.fields');
  const formatter = useFormatter();

  const [newUsername, setNewUsername] = useState<string>('');
  const [usernameError, setUsernameError] = useState<string>('');
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);

  const [profileBio, setProfileBio] = useState<string>('');
  const [profileSnsUrl, setProfileSnsUrl] = useState<string>('');
  const [profileLineUrl, setProfileLineUrl] = useState<string>('');
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');

  const [profileUpdateError, setProfileUpdateError] = useState<string>('');
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState<boolean>(false);
  const [isSavingProfileInfo, setIsSavingProfileInfo] = useState<boolean>(false);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState<boolean>(false);

  const [profilePageUrl, setProfilePageUrl] = useState<string>('');
  const [profileLinkCopied, setProfileLinkCopied] = useState<boolean>(false);

  const profileImageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setNewUsername(user?.username ?? '');
    setProfileBio(user?.bio ?? '');
    setProfileSnsUrl(user?.sns_url ?? '');
    setProfileLineUrl(user?.line_url ?? '');
    setProfileImageUrl(user?.profile_image_url ?? '');
    setProfileLinkCopied(false);

    if (typeof window !== 'undefined' && user?.username) {
      setProfilePageUrl(`${window.location.origin}/u/${user.username}`);
    } else {
      setProfilePageUrl('');
    }
  }, [user]);

  if (!isInitialized) {
    return <PageLoader />;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleUsernameChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setUsernameError('');
    setUpdateSuccess(false);

    const trimmed = newUsername.trim();
    if (!trimmed) {
      setUsernameError(validationT('usernameRequired'));
      return;
    }

    if (trimmed.length < 3 || trimmed.length > 20) {
      setUsernameError(validationT('usernameLength'));
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(trimmed)) {
      setUsernameError(validationT('usernamePattern'));
      return;
    }

    if (trimmed === user.username) {
      setUsernameError(validationT('usernameUnchanged'));
      return;
    }

    try {
      const response = await authApi.updateProfile({ username: trimmed });
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setUpdateSuccess(true);
      setNewUsername(updatedUser?.username ?? trimmed);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error: unknown) {
      setUsernameError(extractErrorDetail(error, errorsT('usernameUpdateFailed')));
    }
  };

  const handleProfileInfoSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileUpdateError('');
    setProfileUpdateSuccess(false);

    const payload = {
      bio: profileBio.trim() || null,
      sns_url: profileSnsUrl.trim() || null,
      line_url: profileLineUrl.trim() || null,
      profile_image_url: profileImageUrl.trim() || null,
    } as const;

    setIsSavingProfileInfo(true);
    try {
      const response = await authApi.updateProfile(payload);
      const updatedUser = response.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setProfileUpdateSuccess(true);
      setTimeout(() => setProfileUpdateSuccess(false), 3000);
    } catch (error: unknown) {
      setProfileUpdateError(extractErrorDetail(error, errorsT('profileUpdateFailed')));
    } finally {
      setIsSavingProfileInfo(false);
    }
  };

  const handleProfileImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProfileUpdateError('');
    setIsUploadingProfileImage(true);
    try {
      const response = await mediaApi.upload(file, { optimize: true, max_width: 512, max_height: 512 });
      const imageUrl = response.data?.url;
      if (imageUrl) {
        setProfileImageUrl(imageUrl);
      }
    } catch (error: unknown) {
      setProfileUpdateError(extractErrorDetail(error, errorsT('uploadFailed')));
    } finally {
      setIsUploadingProfileImage(false);
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = '';
      }
    }
  };

  const handleRemoveProfileImage = () => {
    setProfileImageUrl('');
  };

  const handleCopyProfileLink = () => {
    if (!profilePageUrl || typeof navigator === 'undefined') return;
    navigator.clipboard.writeText(profilePageUrl).then(() => {
      setProfileLinkCopied(true);
      setTimeout(() => setProfileLinkCopied(false), 2000);
    });
  };

  return (
    <DashboardLayout pageTitle={t('title')} pageSubtitle={t('subtitle')}>
      <div className="mx-auto w-full max-w-4xl space-y-8 px-3 py-6 sm:px-6">
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">{t('sections.account.heading')}</h2>
          <p className="text-sm text-slate-600">
            {t('sections.account.description')}
          </p>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('sections.current.heading')}</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-slate-500">{fieldsT('email')}</span>
                <span className="font-medium text-slate-900 break-all">{user.email}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="text-slate-500">{fieldsT('username')}</span>
                <span className="font-medium text-slate-900">{user.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{fieldsT('pointBalance')}</span>
                <span className="font-semibold text-slate-900">{formatter.number(pointBalance)} P</span>
              </div>
            </div>

            {profilePageUrl && (
              <div className="mt-5">
                <p className="text-sm font-medium text-slate-900 mb-2">{t('sections.current.publicProfile')}</p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <input
                    value={profilePageUrl}
                    readOnly
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={handleCopyProfileLink}
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    {profileLinkCopied ? buttonsT('copied') : buttonsT('copyLink')}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('sections.username.heading')}</h3>
              <p className="text-sm text-slate-600">
                {t('sections.username.description')}
              </p>
            </div>

            <form onSubmit={handleUsernameChange} className="space-y-4">
              <div>
                <label htmlFor="newUsername" className="block text-sm font-medium text-slate-700 mb-2">
                  {fieldsT('newUsernameLabel')}
                </label>
                <input
                  id="newUsername"
                  type="text"
                  value={newUsername}
                  onChange={(event) => setNewUsername(event.target.value)}
                  placeholder={fieldsT('newUsernamePlaceholder')}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {usernameError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {usernameError}
                </div>
              )}

              {updateSuccess && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-lg text-sm">
                  <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                  {messagesT('usernameUpdated')}
                </div>
              )}

              <button
                type="submit"
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                {buttonsT('updateUsername')}
              </button>
            </form>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{t('sections.profile.heading')}</h3>

            <form onSubmit={handleProfileInfoSubmit} className="space-y-5">
              <div>
                <label htmlFor="profileBio" className="block text-sm font-medium text-slate-700 mb-2">
                  {fieldsT('bioLabel')}
                </label>
                <textarea
                  id="profileBio"
                  value={profileBio}
                  maxLength={600}
                  onChange={(event) => {
                    setProfileBio(event.target.value);
                    setProfileUpdateError('');
                  }}
                  placeholder={fieldsT('bioPlaceholder')}
                  className="w-full min-h-[120px] px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <div className="mt-1 text-xs text-slate-500 text-right">{fieldsT('bioCounter', { current: profileBio.length, max: 600 })}</div>
              </div>

              <div>
                <label htmlFor="profileSnsUrl" className="block text-sm font-medium text-slate-700 mb-2">
                  {fieldsT('snsLabel')}
                </label>
                <input
                  id="profileSnsUrl"
                  type="url"
                  value={profileSnsUrl}
                  onChange={(event) => {
                    setProfileSnsUrl(event.target.value);
                    setProfileUpdateError('');
                  }}
                  placeholder="https://"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">{fieldsT('snsHint')}</p>
              </div>

              <div>
                <label htmlFor="profileLineUrl" className="block text-sm font-medium text-slate-700 mb-2">
                  {fieldsT('lineLabel')}
                </label>
                <input
                  id="profileLineUrl"
                  type="url"
                  value={profileLineUrl}
                  onChange={(event) => {
                    setProfileLineUrl(event.target.value);
                    setProfileUpdateError('');
                  }}
                  placeholder="https://"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <p className="text-xs text-slate-500 mt-1">{fieldsT('lineHint')}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">{fieldsT('imageLabel')}</label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center text-white text-xl">
                    {profileImageUrl ? (
                      <Image
                        src={profileImageUrl}
                        alt={fieldsT('imagePreviewAlt')}
                        fill
                        className="object-cover"
                        sizes="80px"
                        unoptimized
                      />
                    ) : (
                      <span className="text-slate-500">{fieldsT('noImage')}</span>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 text-sm">
                    <label className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:border-blue-400 hover:text-blue-600 transition-colors cursor-pointer">
                      {isUploadingProfileImage ? buttonsT('uploadingImage') : buttonsT('uploadImage')}
                      <input
                        ref={profileImageInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfileImageUpload}
                        disabled={isUploadingProfileImage}
                      />
                    </label>
                    {profileImageUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveProfileImage}
                        className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-600 hover:bg-red-100 transition-colors"
                      >
                        {buttonsT('removeImage')}
                      </button>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500">{fieldsT('imageHint')}</p>
              </div>

              {profileUpdateError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {profileUpdateError}
                </div>
              )}

              {profileUpdateSuccess && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 px-4 py-3 rounded-lg text-sm">
                  <CheckCircleIcon className="h-4 w-4" aria-hidden="true" />
                  {messagesT('profileUpdated')}
                </div>
              )}

              <button
                type="submit"
                disabled={isSavingProfileInfo}
                className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
                  isSavingProfileInfo
                    ? 'bg-blue-300 text-white cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSavingProfileInfo ? buttonsT('savingProfile') : buttonsT('saveProfile')}
              </button>
            </form>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
