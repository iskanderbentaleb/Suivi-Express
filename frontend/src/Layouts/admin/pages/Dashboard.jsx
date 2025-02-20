import {
    IconArrowDownRight,
    IconArrowUpRight,
    IconCirclePercentage,
    IconPackage,
    IconCalculator,
    IconMoneybag,
  } from '@tabler/icons-react';
  import { Group, Paper, SimpleGrid, Text, Title, Card, Container, Grid } from '@mantine/core';
  import { BarChart, LineChart, PieChart } from '@mantine/charts';
  import classes from './../styles/dashboard.module.css';
import { useState } from 'react';
import { DatePickerInput } from '@mantine/dates';
import '@mantine/dates/styles.css';

  const icons = {
    box: IconPackage,
    percentage: IconCirclePercentage,
    calculator: IconCalculator,
    moneybag: IconMoneybag,
  };
  
  const data = [
    { title: 'Total Orders', icon: 'box', value: '13,456', diff: 34 },
    { title: 'Delivery Rate', icon: 'percentage', value: '4,145', diff: -13 },
    { title: 'Total Agents', icon: 'calculator', value: '745', diff: 18 },
    { title: 'Debts', icon: 'moneybag', value: '188', diff: -30 },
  ];
  
  const companyData = [
    { month: 'Yalidine', delivered: 1200, returned: 900, inProcess: 200 },
    { month: 'Mystro', delivered: 1900, returned: 1200, inProcess: 400 },
    { month: 'ZR Express', delivered: 400, returned: 1000, inProcess: 200 },
  ];
  
  const chartData = [
    { date: '01', Apples: 2890, Oranges: 2338, Tomatoes: 2452 },
    { date: '02', Apples: 2756, Oranges: 2103, Tomatoes: 2402 },
    { date: '03', Apples: 3322, Oranges: 986, Tomatoes: 1821 },
    { date: '04', Apples: 3470, Oranges: 2108, Tomatoes: 2809 },
    { date: '05', Apples: 3129, Oranges: 1726, Tomatoes: 2290 },
    { date: '06', Apples: 3129, Oranges: 1726, Tomatoes: 2290 },
  ];
  
  const pieChartData = [
    { name: 'USA', value: 400, color: 'indigo.6' },
    { name: 'India', value: 300, color: 'yellow.6' },
    { name: 'Japan', value: 300, color: 'teal.6' },
    { name: 'Other', value: 200, color: 'gray.6' },
  ];
  
  export default function Dashboard() {

    const [selectedDates, setSelectedDates] = useState({
        Weekly: null,
        Monthly: null,
        Yearly: null,
      });


    const stats = data.map((stat) => {
      const Icon = icons[stat.icon];
      const DiffIcon = stat.diff > 0 ? IconArrowUpRight : IconArrowDownRight;
  
      return (
        <Card
          withBorder
          p="lg"
          radius="lg"
          key={stat.title}
          shadow="sm"
          className={classes.card}
        >
          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed" className={classes.title}>
              {stat.title}
            </Text>
            <Icon className={classes.icon} size={28} stroke={1.5} />
          </Group>
  
          <Group align="flex-end" gap="xs" mt={20}>
            <Text className={classes.value} fz="xl" fw={800}>
              {stat.value}
            </Text>
          </Group>

        </Card>
      );
    });
  
    return (
      <Container size="xl" py="xl" px="md">
        <Title order={1} mb="xl" className={classes.mainTitle}>
          Dashboard Overview
        </Title>
  
        <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="lg">
          {stats}
        </SimpleGrid>
  
        <Grid gutter="xl" mt="xl">
            {/* BarChart */}
            <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper p="lg" radius="lg" withBorder shadow="sm" className={classes.chartCard}>
                <Title order={3} fw={700} c="dimmed" mb="md">
                    Delivery Company Comparison
                </Title>
                <BarChart
                    h={380}
                    data={companyData}
                    dataKey="month"
                    type="percent"
                    orientation="vertical"
                    barSize={20}
                    series={[
                    { name: 'delivered', color: 'teal.6', label: 'Livré' },
                    { name: 'returned', color: 'red.6', label: 'Retourné' },
                    { name: 'inProcess', color: 'orange.5', label: 'En cours' },
                    ]}
                    withLegend
                    legendProps={{ verticalAlign: 'bottom', height: 40 }}
                    tooltipAnimationDuration={200}
                    padding={{ left: 40, right: 20, top: 20, bottom: 40 }}
                />
                </Paper>
            </Grid.Col>
    
            {/* PieChart */}
            <Grid.Col span={{ base: 12, md: 6 }}>
                <Paper
                    p="lg"
                    radius="lg"
                    withBorder
                    shadow="sm"
                    className={classes.chartCard}
                    style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}
                >
                    <Title order={3} fw={700} c="dimmed" mb="md">
                    Orders Breakdown
                    </Title>
                    <PieChart
                    size={300}
                    data={pieChartData}
                    labelsPosition="outside"
                    labelsType="percent"
                    withLabels
                    withTooltip
                    strokeWidth={2}
                    tooltipAnimationDuration={200}
                    withLegend
                    legendProps={{ layout: 'horizontal', align: 'center' }}
                    />
                </Paper>
            </Grid.Col>

    
            {/* LineChart */}
            <Grid.Col span={{ base: 12 }}>
                {['Weekly', 'Monthly', 'Yearly'].map((period) => (
                    <Paper
                    key={period}
                    p="lg"
                    radius="lg"
                    withBorder
                    shadow="sm"
                    className={classes.chartCard}
                    mb="xl"
                    >
                    <Title order={3} fw={700} c="dimmed" mb="md">
                        {period} Orders Performance
                    </Title>

                    {/* Date Picker for each period */}
                    <Group position="center" mb="md">
                        <DatePickerInput
                        value={selectedDates[period]}
                        onChange={(date) =>
                            setSelectedDates((prev) => ({ ...prev, [period]: date }))
                        }
                        placeholder={`Select ${period} Date`}
                        label={`${period} Date`}
                        />
                    </Group>

                    {/* Line Chart */}
                    <LineChart
                        h={300}
                        data={chartData}
                        dataKey="date"
                        series={[
                        { name: 'Apples', color: 'indigo.6', label: 'Apples' },
                        { name: 'Oranges', color: 'blue.6', label: 'Oranges' },
                        { name: 'Tomatoes', color: 'teal.6', label: 'Tomatoes' },
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
                    </Paper>
                ))}
            </Grid.Col>
        </Grid>
      </Container>
    );
  }