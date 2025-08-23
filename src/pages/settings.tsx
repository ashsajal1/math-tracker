import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Moon, Sun, Bell, CreditCard, Palette, Save } from 'lucide-react';

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    theme: 'system',
    currency: 'USD',
    notifications: {
      email: true,
      push: true,
      weeklyReport: true,
      monthlySummary: true,
    },
    currencySymbol: '$',
    decimalPlaces: 2,
    dateFormat: 'MM/dd/yyyy',
  });

  // Load saved settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleThemeChange = (value: string) => {
    const newSettings = { ...settings, theme: value };
    setSettings(newSettings);
    applyTheme(value);
  };

  const applyTheme = (theme: string) => {
    const root = window.document.documentElement;
    
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  const handleSave = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    toast({
      title: 'Settings saved',
      description: 'Your preferences have been saved successfully.',
    });
  };

  const handleReset = () => {
    const defaultSettings = {
      theme: 'system',
      currency: 'USD',
      notifications: {
        email: true,
        push: true,
        weeklyReport: true,
        monthlySummary: true,
      },
      currencySymbol: '$',
      decimalPlaces: 2,
      dateFormat: 'MM/dd/yyyy',
    };
    setSettings(defaultSettings);
    applyTheme('system');
  };

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  ];

  const dateFormats = [
    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
    { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
    { value: 'dd MMM yyyy', label: 'DD MMM YYYY' },
  ];

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your application preferences</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              <CardTitle>Appearance</CardTitle>
            </div>
            <CardDescription>Customize the look and feel of the app</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select value={settings.theme} onValueChange={handleThemeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      <span>Light</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      <span>Dark</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <span className="h-4 w-4">🌓</span>
                      <span>System</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Currency Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <CardTitle>Currency</CardTitle>
            </div>
            <CardDescription>Set your preferred currency and formatting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={settings.currency}
                onValueChange={(value) => setSettings({...settings, currency: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {`${currency.name} (${currency.symbol})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="decimalPlaces">Decimal Places</Label>
              <Input 
                type="number" 
                min="0" 
                max="4" 
                value={settings.decimalPlaces}
                onChange={(e) => setSettings({...settings, decimalPlaces: parseInt(e.target.value) || 0})}
              />
            </div>
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card>
          <CardHeader>
            <CardTitle>Date & Time</CardTitle>
            <CardDescription>Configure how dates are displayed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="dateFormat">Date Format</Label>
              <Select 
                value={settings.dateFormat}
                onValueChange={(value) => setSettings({...settings, dateFormat: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  {dateFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label} ({new Date().toLocaleDateString(undefined, { dateStyle: 'long' })})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Manage your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch 
                id="email-notifications"
                checked={settings.notifications.email}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  notifications: {...settings.notifications, email: checked}
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive push notifications</p>
              </div>
              <Switch 
                id="push-notifications"
                checked={settings.notifications.push}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  notifications: {...settings.notifications, push: checked}
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-reports">Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Receive a weekly summary of your expenses</p>
              </div>
              <Switch 
                id="weekly-reports"
                checked={settings.notifications.weeklyReport}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  notifications: {...settings.notifications, weeklyReport: checked}
                })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="monthly-summary">Monthly Summary</Label>
                <p className="text-sm text-muted-foreground">Receive a monthly summary of your expenses</p>
              </div>
              <Switch 
                id="monthly-summary"
                checked={settings.notifications.monthlySummary}
                onCheckedChange={(checked) => setSettings({
                  ...settings,
                  notifications: {...settings.notifications, monthlySummary: checked}
                })}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
