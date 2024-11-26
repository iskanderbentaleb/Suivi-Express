import {Group, Progress, Table, Text } from '@mantine/core';
import classes from './../styles/Users.module.css';

const data = [
  {
    id:1 ,
    name: 'Iskander Bentaleb',
    email: 'IskanderBoss1999@gmail.com',
    reviews: { livré: 2223, echec: 259 },
  },
];

export default function Users() {
  const rows = data.map((row) => {
    const totalReviews = row.reviews.livré + row.reviews.echec;
    const positiveReviews = (row.reviews.livré / totalReviews) * 100;
    const negativeReviews = (row.reviews.echec / totalReviews) * 100;

    return (
      <Table.Tr key={row.id}>
        
        <Table.Td>
          {row.name}
        </Table.Td>

        <Table.Td>
          {row.email}
        </Table.Td>

        <Table.Td>
          <Group justify="space-between">
            <Text fz="xs" c="teal" fw={700}>
              {positiveReviews.toFixed(0)}%
            </Text>
            <Text fz="xs" c="red" fw={700}>
              {negativeReviews.toFixed(0)}%
            </Text>
          </Group>
          <Progress.Root>
            <Progress.Section
              className={classes.progressSection}
              value={positiveReviews}
              color="teal"
            />

            <Progress.Section
              className={classes.progressSection}
              value={negativeReviews}
              color="red"
            />
          </Progress.Root>
        </Table.Td>

      </Table.Tr>
    );
  });

  return (
    <>
      Users
      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="xs" withTableBorder withColumnBorders >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Delevevey Rate</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>

  );
}