import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconCirclePercentage,
  IconBox,
  IconCalculator,
  IconMoneybag,
} from '@tabler/icons-react';
import { Group, Paper, SimpleGrid, Text, Title, Card, Container, Grid } from '@mantine/core';
import { BarChart, LineChart } from '@mantine/charts';
import classes from './../styles/dashboard.module.css';

const icons = {
  box: IconBox,
  percentage: IconCirclePercentage,
  calculator: IconCalculator,
  moneybag: IconMoneybag,
};

const data = [
  { title: 'Orders', icon: 'box', value: '13,456', diff: 34 },
  { title: 'Delivery Rate', icon: 'percentage', value: '4,145', diff: -13 },
  { title: 'Total Agents', icon: 'calculator', value: '745', diff: 18 },
  { title: 'Debts', icon: 'moneybag', value: '188', diff: -30 },
];

const companyData = [
  { month: 'Yalidine', delivered: 1200, returned: 900, inProcess: 200 },
  { month: 'Mystro', delivered: 1900, returned: 1200, inProcess: 400 },
  { month: 'ZR express', delivered: 400, returned: 1000, inProcess: 200 },
];

const chartData = [
  { date: '01', Apples: 2890, Oranges: 2338, Tomatoes: 2452 },
  { date: '02', Apples: 2756, Oranges: 2103, Tomatoes: 2402 },
  { date: '03', Apples: 3322, Oranges: 986, Tomatoes: 1821 },
  { date: '04', Apples: 3470, Oranges: 2108, Tomatoes: 2809 },
  { date: '05', Apples: 3129, Oranges: 1726, Tomatoes: 2290 },
  { date: '06', Apples: 3129, Oranges: 1726, Tomatoes: 2290 },
];

export default function Dashboard() {
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
          <Text className={classes.value} fz="xl" fw={700}>
            {stat.value}
          </Text>
          <Text
            c={stat.diff > 0 ? 'teal.6' : 'red.6'}
            fz="sm"
            fw={600}
            className={classes.diff}
          >
            <span>{stat.diff}%</span>
            <DiffIcon size={18} stroke={1.8} />
          </Text>
        </Group>

        <Text fz="xs" c="dimmed" mt={5}>
          Compared to last month
        </Text>
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
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="lg" radius="lg" withBorder shadow="sm" className={classes.chartCard}>
            <Title order={3} fw={700} c="dimmed" mb="md">
              Delivery Company Comparison
            </Title>
            <BarChart
              h={300}
              data={companyData}
              dataKey="month"
              type="percent"
              orientation="vertical"
              series={[
                { name: 'delivered', color: 'teal', label: 'Delivered' },
                { name: 'returned', color: 'red', label: 'Returned' },
                { name: 'inProcess', color: 'orange.3', label: 'In Process' },
              ]}
              withLegend
              legendProps={{ verticalAlign: 'bottom', height: 40 }}
              tooltipAnimationDuration={200}
              padding={{ left: 40, right: 20, top: 20, bottom: 40 }}
            />
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
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
              <LineChart
                h={300}
                data={chartData}
                dataKey="date"
                series={[
                  { name: 'Apples', color: 'indigo.6', label: 'Apples' },
                  { name: 'Oranges', color: 'blue.6', label: 'Oranges' },
                  { name: 'Tomatoes', color: 'teal.6', label: 'Tomatoes' },
                ]}
                curveType="natural"
                withDots={false}
                withTooltip
                tooltipAnimationDuration={200}
                gridAxis="xy"
                tickLine="xy"
                strokeWidth={2}
                padding={{ left: 40, right: 20, top: 20, bottom: 40 }}
              />
            </Paper>
          ))}
        </Grid.Col>
      </Grid>
    </Container>
  );
}