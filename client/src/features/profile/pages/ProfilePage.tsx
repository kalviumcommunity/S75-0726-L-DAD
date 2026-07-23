import { useEffect, useMemo, useState } from 'react';
import Button from '../../../components/common/Button';
import PageHeader from '../../../components/common/PageHeader';
import { useAuth } from '../../../context/auth/AuthContext';
import { authApi, type NotificationPreferences } from '../../../services/api/auth.service';

type ThemePreference = 'light' | 'dark';

type ProfileFormState = {
  fullName: string;
  email: string;
};

type PasswordFormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type SettingsState = {
  theme: ThemePreference;
  emailAlerts: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
};

const emptyProfileForm = (user?: { fullName?: string; email?: string } | null): ProfileFormState => ({
  fullName: user?.fullName || '',
  email: user?.email || '',
});

const defaultPreferences = (user?: { theme?: ThemePreference; notificationPreferences?: NotificationPreferences } | null): SettingsState => ({
  theme: user?.theme || 'light',
  emailAlerts: user?.notificationPreferences?.emailAlerts ?? true,
  pushNotifications: user?.notificationPreferences?.pushNotifications ?? true,
  weeklyDigest: user?.notificationPreferences?.weeklyDigest ?? false,
});

const ProfilePage = () => {
  const { user, updateUser, refreshUser } = useAuth();
  const [profileForm, setProfileForm] = useState<ProfileFormState>(emptyProfileForm(user));
  const [passwordForm, setPasswordForm] = useState<PasswordFormState>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [preferences, setPreferences] = useState<SettingsState>(defaultPreferences(user));
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [profileErrors, setProfileErrors] = useState<string[]>([]);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setProfileForm(emptyProfileForm(user));
    setPreferences(defaultPreferences(user));
  }, [user]);

  const roleLabel = useMemo(() => user?.role || 'Coordinator', [user?.role]);

  const validateProfile = () => {
    const nextErrors: string[] = [];
    if (profileForm.fullName.trim().length < 2) nextErrors.push('Full name must be at least 2 characters long');
    if (!/^\S+@\S+\.\S+$/.test(profileForm.email.trim())) nextErrors.push('Please provide a valid email address');
    return nextErrors;
  };

  const validatePassword = () => {
    const nextErrors: string[] = [];
    if (!passwordForm.currentPassword.trim()) nextErrors.push('Current password is required');
    if (passwordForm.newPassword.length < 8) nextErrors.push('New password must be at least 8 characters long');
    if (passwordForm.newPassword !== passwordForm.confirmPassword) nextErrors.push('New password confirmation does not match');
    return nextErrors;
  };

  const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateProfile();
    setProfileErrors(errors);
    if (errors.length > 0) return;

    try {
      setLoading(true);
      const updatedUser = await authApi.updateProfile(profileForm.fullName.trim(), profileForm.email.trim().toLowerCase());
      updateUser(updatedUser);
      await refreshUser();
      setSuccessMessage('Profile information updated successfully.');
    } catch (error: any) {
      const details = error.response?.data?.details || [error.response?.data?.message || 'Unable to update profile.'];
      setProfileErrors(Array.isArray(details) ? details : [details]);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validatePassword();
    setPasswordErrors(errors);
    if (errors.length > 0) return;

    try {
      setPasswordLoading(true);
      await authApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSuccessMessage('Password changed successfully.');
    } catch (error: any) {
      const details = error.response?.data?.details || [error.response?.data?.message || 'Unable to change password.'];
      setPasswordErrors(Array.isArray(details) ? details : [details]);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePreferencesSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setLoading(true);
      const updatedUser = await authApi.updatePreferences(preferences.theme, {
        emailAlerts: preferences.emailAlerts,
        pushNotifications: preferences.pushNotifications,
        weeklyDigest: preferences.weeklyDigest,
      });
      updateUser(updatedUser);
      setSuccessMessage('Notification and theme preferences saved.');
    } catch (error: any) {
      setProfileErrors([error.response?.data?.message || 'Unable to save preferences.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Update your profile, security, and workspace preferences." />

      {successMessage && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMessage}</div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={handleProfileSubmit} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Profile information</h3>
              <p className="text-sm text-slate-500">Keep the account details used across the operations workspace.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{roleLabel}</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Full name
              <input
                value={profileForm.fullName}
                onChange={(event) => setProfileForm((current) => ({ ...current, fullName: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Email address
              <input
                type="email"
                value={profileForm.email}
                onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
              />
            </label>
          </div>

          {profileErrors.length > 0 && (
            <ul className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">
              {profileErrors.map((error) => (
                <li key={error}>• {error}</li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex justify-end">
            <Button type="submit" loading={loading}>Save profile</Button>
          </div>
        </form>

        <form onSubmit={handlePasswordSubmit} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Change password</h3>
          <p className="mt-1 text-sm text-slate-500">Use a new password that is at least 8 characters long.</p>

          <div className="mt-6 space-y-4">
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Current password
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              New password
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
              />
            </label>
            <label className="space-y-2 text-sm font-medium text-slate-700">
              Confirm new password
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-900"
              />
            </label>
          </div>

          {passwordErrors.length > 0 && (
            <ul className="mt-4 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">
              {passwordErrors.map((error) => (
                <li key={error}>• {error}</li>
              ))}
            </ul>
          )}

          <div className="mt-6 flex justify-end">
            <Button type="submit" variant="secondary" loading={passwordLoading}>Update password</Button>
          </div>
        </form>
      </div>

      <form onSubmit={handlePreferencesSubmit} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Appearance and notifications</h3>
        <p className="mt-1 text-sm text-slate-500">Set the default theme and decide which alerts you want to receive.</p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">Theme preference</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {(['light', 'dark'] as ThemePreference[]).map((theme) => (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setPreferences((current) => ({ ...current, theme }))}
                  className={`rounded-2xl border px-4 py-3 text-sm font-medium transition ${preferences.theme === theme ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}
                >
                  {theme === 'light' ? 'Light' : 'Dark'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-700">Notification preferences</p>
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
              Email alerts
              <input
                type="checkbox"
                checked={preferences.emailAlerts}
                onChange={(event) => setPreferences((current) => ({ ...current, emailAlerts: event.target.checked }))}
              />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
              Push notifications
              <input
                type="checkbox"
                checked={preferences.pushNotifications}
                onChange={(event) => setPreferences((current) => ({ ...current, pushNotifications: event.target.checked }))}
              />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
              Weekly digest
              <input
                type="checkbox"
                checked={preferences.weeklyDigest}
                onChange={(event) => setPreferences((current) => ({ ...current, weeklyDigest: event.target.checked }))}
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" variant="secondary" loading={loading}>Save preferences</Button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
