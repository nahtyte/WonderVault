import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import NavBar from './components/NavBar';
import VaultView from './components/VaultView';
import SecurityDashboard from './components/SecurityDashboard';
import AuthPage from './components/AuthPage';
import type { CredentialPayload } from './components/CredentialForm';

type Tab = 'vault' | 'security';

type Credential = {
  id: string;
  website: string;
  username: string;
  password: string;
  notes: string;
  createdAt: string;
  strength: 'weak' | 'medium' | 'strong';
  reused: boolean;
};

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  variant: 'success' | 'warning' | 'info' | 'neutral';
};

const defaultActivity: ActivityItem[] = [
  {
    id: '1',
    title: 'Login from 127.0.0.1',
    description: 'Local access granted • 14/05/2569 21:11:11',
    variant: 'info',
  },
  {
    id: '2',
    title: 'Added credential for securevault.app',
    description: 'Encrypted data stored securely • 14/05/2569 20:53:34',
    variant: 'success',
  },
  {
    id: '3',
    title: 'Deleted credential id=10',
    description: 'Removed expired credential • 14/05/2569 21:11:55',
    variant: 'warning',
  },
];

const getPasswordStrength = (password: string): Credential['strength'] => {
  if (!password) {
    return 'weak';
  }

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (password.length >= 12 && hasUpper && hasLower && hasNumber && hasSymbol) {
    return 'strong';
  }

  if (password.length >= 8 && ((hasUpper && hasLower && hasNumber) || (hasLower && hasNumber && hasSymbol))) {
    return 'medium';
  }

  return 'weak';
};

const generateStrongPassword = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*()-_=+[]{}|;:,.<>?';
  return Array.from({ length: 16 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ username: string; email?: string } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('vault');
  const [darkMode, setDarkMode] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>(defaultActivity);

  const filteredCredentials = useMemo(
    () =>
      credentials.filter((item) =>
        [item.website, item.username, item.notes].some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()))
      ),
    [credentials, searchTerm]
  );

  const stats = useMemo(() => {
    const total = credentials.length;
    const weak = credentials.filter((item) => item.strength === 'weak').length;
    const reused = credentials.filter((item) => item.reused).length;
    const strong = credentials.filter((item) => item.strength === 'strong').length;
    const score = Math.max(32, 100 - weak * 16 - reused * 10);

    return { total, weak, reused, strong, score };
  }, [credentials]);

  const handleSaveCredential = (payload: CredentialPayload) => {
    const strength = getPasswordStrength(payload.password);
    const nextCredential: Credential = {
      id: `${Date.now()}`,
      website: payload.website,
      username: payload.username,
      password: payload.password,
      notes: payload.notes,
      createdAt: new Date().toLocaleString('en-GB', { hour12: false }),
      strength,
      reused: false,
    };

    setCredentials((current) => [nextCredential, ...current]);
    setActivity((current) => [
      {
        id: `${Date.now()}-activity`,
        title: `Encrypted credential for ${payload.website}`,
        description: `Added to vault • ${new Date().toLocaleString('en-GB', { hour12: false })}`,
        variant: 'success',
      },
      ...current,
    ]);
    setShowForm(false);
    setActiveTab('vault');
  };

  const handleLogin = (username: string, password: string) => {
    // TODO: Implement backend authentication
    setUser({ username });
    setIsAuthenticated(true);
  };

  const handleRegister = (username: string, email: string, password: string) => {
    // TODO: Implement backend registration
    setUser({ username, email });
    setIsAuthenticated(true);
  };

  const handleDeleteCredential = (id: string) => {
    setCredentials((current) => current.filter((item) => item.id !== id));
    setActivity((current) => [
      {
        id: `${Date.now()}-activity`,
        title: 'Deleted credential',
        description: `Removed credential • ${new Date().toLocaleString('en-GB', { hour12: false })}`,
        variant: 'warning',
      },
      ...current,
    ]);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setCredentials([]);
    setActivity(defaultActivity);
    setActiveTab('vault');
  };

  return (
    <>
      {!isAuthenticated ? (
        <AuthPage onLogin={handleLogin} onRegister={handleRegister} />
      ) : (
        <div className={`min-h-screen text-slate-900 transition-colors duration-300 ${
          darkMode ? 'bg-[#05070A] text-slate-100' : 'bg-slate-100'
        }`}>
          <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8">
            <NavBar
              activeTab={activeTab}
              onChange={(tab) => setActiveTab(tab)}
              darkMode={darkMode}
              onToggleTheme={() => setDarkMode((current) => !current)}
              user={user}
              onLogout={handleLogout}
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.28 }}
              >
                {activeTab === 'vault' ? (
                  <VaultView
                    credentials={filteredCredentials}
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    onOpenForm={() => setShowForm(true)}
                    showForm={showForm}
                    onCloseForm={() => setShowForm(false)}
                    onSaveCredential={handleSaveCredential}
                    onDeleteCredential={handleDeleteCredential}
                  />
                ) : (
                  <SecurityDashboard stats={stats} activity={activity} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </>
  );
}
