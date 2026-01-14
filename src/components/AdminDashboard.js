import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import {
  People,
  Chat,
  Phone,
  Security,
  TrendingUp,
  Warning,
  Block,
  Report,
  Visibility,
  Close,
  Public,
  Schedule,
  Speed
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';

const AdminDashboard = ({ darkMode }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeChats: 0,
    activeCalls: 0,
    waitingUsers: 0,
    bannedUsers: 0,
    reports: 0,
    messagesPerMinute: 0,
    averageSessionTime: 0
  });

  const [realTimeData, setRealTimeData] = useState([]);
  const [genderDistribution, setGenderDistribution] = useState([]);
  const [countryDistribution, setCountryDistribution] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Simulate API calls
      const response = await fetch('/api/admin/analytics');
      const data = await response.json();
      
      setStats(data.stats);
      setRealTimeData(prev => [...prev.slice(-20), {
        time: new Date().toLocaleTimeString(),
        users: data.stats.totalUsers,
        chats: data.stats.activeChats,
        calls: data.stats.activeCalls
      }]);
      
      setGenderDistribution(data.genderDistribution);
      setCountryDistribution(data.countryDistribution);
      setActivityData(data.activityData);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const StatCard = ({ title, value, icon, color, trend }) => (
    <Card sx={{ 
      background: darkMode 
        ? 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 100%)'
        : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,1) 100%)',
      border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
      height: '100%'
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h4" sx={{ color, fontWeight: 'bold' }}>
              {value.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {trend && (
              <Chip 
                label={`${trend > 0 ? '+' : ''}${trend}%`}
                size="small"
                color={trend > 0 ? 'success' : 'error'}
                sx={{ mt: 1 }}
              />
            )}
          </Box>
          <Box sx={{ 
            background: `${color}20`,
            borderRadius: '50%',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4ecdc4'];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: darkMode ? '#fff' : '#1e293b' }}>
          Real-time Analytics Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor your stranger chat platform in real-time
        </Typography>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users Online"
            value={stats.totalUsers}
            icon={<People sx={{ fontSize: 30, color: '#667eea' }} />}
            color="#667eea"
            trend={12}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Chats"
            value={stats.activeChats}
            icon={<Chat sx={{ fontSize: 30, color: '#4ecdc4' }} />}
            color="#4ecdc4"
            trend={8}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Calls"
            value={stats.activeCalls}
            icon={<Phone sx={{ fontSize: 30, color: '#f5576c' }} />}
            color="#f5576c"
            trend={-3}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Security Alerts"
            value={stats.reports}
            icon={<Security sx={{ fontSize: 30, color: '#ff6b6b' }} />}
            color="#ff6b6b"
            trend={-15}
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Real-time Activity */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ 
            p: 3, 
            background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
            border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h6" gutterBottom>
              Real-time Activity
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={realTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="users" stroke="#667eea" strokeWidth={2} />
                <Line type="monotone" dataKey="chats" stroke="#4ecdc4" strokeWidth={2} />
                <Line type="monotone" dataKey="calls" stroke="#f5576c" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Gender Distribution */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ 
            p: 3, 
            background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
            border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h6" gutterBottom>
              User Demographics
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={genderDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {genderDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Detailed Tables */}
      <Grid container spacing={3}>
        {/* Top Countries */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
            border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h6" gutterBottom>
              Top Countries
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Country</TableCell>
                    <TableCell align="right">Users</TableCell>
                    <TableCell align="right">%</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {countryDistribution.slice(0, 10).map((country, index) => (
                    <TableRow key={country.name}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Public sx={{ fontSize: 16 }} />
                          {country.name}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{country.users}</TableCell>
                      <TableCell align="right">{country.percentage}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* System Health */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ 
            p: 3, 
            background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
            border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h6" gutterBottom>
              System Health
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Speed color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Server Response Time" 
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={85} 
                        sx={{ flex: 1, height: 6, borderRadius: 3 }}
                        color="success"
                      />
                      <Typography variant="caption">85ms</Typography>
                    </Box>
                  }
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Security color="warning" />
                </ListItemIcon>
                <ListItemText 
                  primary="Security Score" 
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={92} 
                        sx={{ flex: 1, height: 6, borderRadius: 3 }}
                        color="success"
                      />
                      <Typography variant="caption">92/100</Typography>
                    </Box>
                  }
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <Schedule color="info" />
                </ListItemIcon>
                <ListItemText 
                  primary="Average Session Time" 
                  secondary={`${Math.floor(stats.averageSessionTime / 60)}m ${stats.averageSessionTime % 60}s`}
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon>
                  <TrendingUp color="success" />
                </ListItemIcon>
                <ListItemText 
                  primary="Messages per Minute" 
                  secondary={stats.messagesPerMinute.toLocaleString()}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ 
        p: 3, 
        mt: 3,
        background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.9)',
        border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            icon={<Visibility />} 
            label="View Reports" 
            onClick={() => setSelectedDetail('reports')}
            clickable
          />
          <Chip 
            icon={<Block />} 
            label="Banned Users" 
            onClick={() => setSelectedDetail('banned')}
            clickable
          />
          <Chip 
            icon={<Warning />} 
            label="Security Alerts" 
            onClick={() => setSelectedDetail('alerts')}
            clickable
          />
          <Chip 
            icon={<People />} 
            label="User Management" 
            onClick={() => setSelectedDetail('users')}
            clickable
          />
        </Box>
      </Paper>

      {/* Detail Modal */}
      <Dialog 
        open={!!selectedDetail} 
        onClose={() => setSelectedDetail(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {selectedDetail === 'reports' && 'User Reports'}
            {selectedDetail === 'banned' && 'Banned Users'}
            {selectedDetail === 'alerts' && 'Security Alerts'}
            {selectedDetail === 'users' && 'User Management'}
          </Typography>
          <IconButton onClick={() => setSelectedDetail(null)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>
            Detailed view for {selectedDetail} would be implemented here with real data.
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;