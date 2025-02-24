import {
    IconCirclePercentage,
    IconPackage,
    IconCalculator,
    IconMoneybag,
  } from '@tabler/icons-react';
  import { Group, Paper, SimpleGrid, Text, Title, Card, Container, Grid, Loader, Skeleton, Select, Flex } from '@mantine/core';
  import { BarChart, LineChart, PieChart } from '@mantine/charts';
  import classes from './../styles/dashboard.module.css';
  import { useEffect, useState } from 'react';
  import { dashboard } from '../../../services/api/admin/dashboard';
  import dayjs from 'dayjs';
  import CountUp from 'react-countup'; // Import CountUp
  
  // Icon Mapping for Stats Cards
  const icons = {
    box: IconPackage,
    percentage: IconCirclePercentage,
    calculator: IconCalculator,
    moneybag: IconMoneybag,
  };
  
  export default function Dashboard() {
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
      total_orders: 0,
      delivery_rate: 0,
      total_agents: 0,
      status_distribution: [],
      delivery_companies: [],
    });
  
    const [chartData, setChartData] = useState({
      Weekly: [],
      Monthly: [],
      Yearly: [],
    });
  
    const [year, setYear] = useState(dayjs().year());
    const [minYear, setMinYear] = useState(dayjs().year());
    const [yearOptions, setYearOptions] = useState([]);
  
    // Fetch Dashboard Data
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const { data } = await dashboard.index();
        setDashboardData(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des données du tableau de bord:', error);
      } finally {
        setLoading(false);
      }
    };
  
    // Fetch Minimum Year
    const fetchMinYear = async () => {
      try {
        const { data } = await dashboard.getMinYear();
        setMinYear(data.min_year);
        generateYearOptions(data.min_year);
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'année minimale:', error);
      }
    };
  
    // Fetch Yearly Data
    const fetchYearlyChartData = async () => {
      setLoading(true);
      try {
        const { data } = await dashboard.getOrdersByYear({ year });
        setChartData((prev) => ({ ...prev, Yearly: data.data }));
      } catch (error) {
        console.error('Erreur lors de la récupération des données annuelles:', error);
      } finally {
        setLoading(false);
      }
    };
  
    // Generate Year Options
    const generateYearOptions = (minYear) => {
      const options = Array.from({ length: dayjs().year() - minYear + 1 }, (_, i) => ({
        value: (minYear + i).toString(),
        label: (minYear + i).toString(),
      }));
      setYearOptions(options);
    };
  
    useEffect(() => {
      fetchMinYear();
      fetchDashboardData();
      fetchYearlyChartData();
    }, [year]);
  
    // Dashboard Statistics Cards
    const stats = [
      { title: 'Commandes Totales', icon: 'box', value: dashboardData.total_orders },
      { title: 'Taux de Livraison', icon: 'percentage', value: dashboardData.delivery_rate },
      { title: 'Agents Totaux', icon: 'calculator', value: dashboardData.total_agents },
    ];
  
    // Render a message if no data is available
    const renderNoDataMessage = (message) => (
      <Text c="dimmed" fz="lg" ta="center" py="xl">
        {message}
      </Text>
    );
  
    return (
      <Container size="xl" py="xl" px="md">
        <Title order={1} mb="xl" className={classes.mainTitle}>
          Aperçu du Tableau de Bord
        </Title>
  
        {/* Stats Cards */}
        <SimpleGrid cols={{ base: 1, xs: 2, md: 3 }} spacing="lg">
          {loading
            ? Array(3).fill(null).map((_, index) => (
                <Skeleton key={index} height={120} radius="lg" />
              ))
            : stats.map((stat) => {
                const Icon = icons[stat.icon];
                return (
                  <Card withBorder p="lg" radius="lg" key={stat.title} shadow="sm" className={classes.card}>
                    <Group justify="space-between" align="center">
                      <Text size="sm" c="dimmed" className={classes.title}>
                        {stat.title}
                      </Text>
                      <Icon className={classes.icon} size={28} stroke={1.5} />
                    </Group>
                    <Group align="flex-end" gap="xs" mt={20}>
                      <Text className={classes.value} fz="xl" fw={800}>
                        {stat.title === 'Taux de Livraison' ? (
                          <CountUp
                            end={stat.value}
                            suffix="%"
                            duration={2}
                            decimals={2}
                          />
                        ) : (
                          <CountUp
                            end={stat.value}
                            duration={2}
                          />
                        )}
                      </Text>
                    </Group>
                  </Card>
                );
              })}
        </SimpleGrid>
  
        {/* Charts Section */}
        <Grid gutter="xl" mt="xl">
          {/* BarChart - Delivery Company Comparison */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="lg" radius="lg" withBorder shadow="sm" className={classes.chartCard}>
              <Title order={3} fw={700} c="dimmed" mb="md">
                Comparaison des Sociétés de Livraison
              </Title>
              {loading ? (
                <Skeleton height={300} radius="lg" />
              ) : dashboardData.delivery_companies.length === 0 ? (
                renderNoDataMessage("Aucune donnée disponible pour les sociétés de livraison.")
              ) : (
                <BarChart
                  h={380}
                  data={dashboardData.delivery_companies}
                  dataKey="company"
                  series={[
                    { name: 'delivered', color: 'teal.6', label: 'Livré' },
                    { name: 'returned', color: 'red.7', label: 'Retourné' },
                    { name: 'inProcess', color: 'gray.5', label: 'En cours' },
                  ]}
                  withLegend
                  legendProps={{ verticalAlign: 'bottom', height: 40 }}
                  tooltipAnimationDuration={200}
                  padding={{ left: 40, right: 20, top: 20, bottom: 40 }}
                />
              )}
            </Paper>
          </Grid.Col>
  
          {/* PieChart - Order Status Distribution */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Paper p="lg" radius="lg" withBorder shadow="sm" className={classes.chartCard}>
              <Title order={3} fw={700} c="dimmed" mb="md">
                Répartition des Commandes
              </Title>
              {loading ? (
                <Skeleton height={300} radius="lg" />
              ) : dashboardData.status_distribution.length === 0 ? (
                renderNoDataMessage("Aucune donnée disponible pour le statut des commandes.")
              ) : (
                <Flex justify="center" align="center">
                    <PieChart
                    size={300}
                    data={dashboardData.status_distribution}
                    labelsPosition="outside"
                    labelsType="percent"
                    withLabels
                    withTooltip
                    strokeWidth={2}
                    tooltipAnimationDuration={200}
                    withLegend
                    legendProps={{ layout: 'horizontal', align: 'center' }}
                    />
                </Flex>
              )}
            </Paper>
          </Grid.Col>
  
          {/* LineChart Yearly */}
          <Grid.Col span={{ base: 12 }}>
            <Paper p="lg" radius="lg" withBorder shadow="sm" className={classes.chartCard} mb="xl">
              <Title order={3} fw={700} c="dimmed" mb="md">
                Performance Annuelle des Commandes ({year})
              </Title>
              <Group position="center" mb="md">
                <Select
                  value={year.toString()}
                  onChange={(value) => setYear(parseInt(value))}
                  data={yearOptions}
                  placeholder="Sélectionner une Année"
                  label="Année"
                  disabled={loading}
                />
              </Group>
              {loading ? (
                <Skeleton height={300} radius="lg" />
              ) : chartData.Yearly.length === 0 ? (
                <Text c="dimmed" fz="lg" ta="center" py="xl">
                  Aucune donnée disponible pour {year}.
                </Text>
              ) : (
                <LineChart
                  h={300}
                  data={chartData.Yearly}
                  dataKey="date"
                  series={[
                    { name: 'created_orders', color: 'blue.4', label: 'Commandes Créées' },
                    { name: 'delivered_orders', color: 'teal.6', label: 'Commandes Livrées' },
                    { name: 'returned_orders', color: 'red.6', label: 'Commandes Retournées' },
                  ]}
                  curveType="monotone"
                  withDots
                  withTooltip
                  tooltipAnimationDuration={200}
                  gridAxis="xy"
                  tickLine="xy"
                  strokeWidth={2.5}
                  padding={{ left: 40, right: 20, top: 20, bottom: 40 }}
                />
              )}
            </Paper>
          </Grid.Col>
        </Grid>
      </Container>
    );
  }