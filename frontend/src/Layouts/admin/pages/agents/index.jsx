import {
  Anchor,
  Group,
  Progress,
  Table,
  Text,
  Flex,
  SimpleGrid,
  TextInput,
  rem,
  ActionIcon,
  Button,
  Pagination,
  Paper,
  Skeleton,
} from '@mantine/core';
import { IconSearch, IconArrowRight, IconTrash, IconPencil } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { agents } from '../../../../services/api/admin/agents';





export default function Agents() {
  const [activePage, setActivePage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [elements, setElements] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');





  const form = useForm({
    initialValues: { search: '' },
  });


  const styleCard = {
    background: 'white',
    borderRadius: rem(8),
    padding: rem(16),
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  };


  const CreateUserModal = () => modals.openConfirmModal({
    title: 'Please confirm your action',
    centered: true,
    children: (
      <Text size="sm">
        This action is so important that you are required to confirm it with a modal. Please click
        one of these buttons to proceed.
      </Text>
    ),
    labels: { confirm: 'Confirm', cancel: 'Cancel' },
    onCancel: () => console.log('Cancel'),
    onConfirm: () => console.log('Confirmed'),
  });





  // --------------- search agents --------------------
  const handleSearch = (values) => {
    const trimmedSearch = values.search.trim().toLowerCase();
    if (trimmedSearch !== search) {
      setSearch(trimmedSearch);
      setActivePage(1);
    }
  };
  // --------------- search agents --------------------




    // ------------------- feetch agents -------------------
  const feetchAgents = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await agents.index(page, search);
      setElements(data.data);
      setTotalPages(data.meta.last_page || 1); // Update total pages
      setLoading(false);
    } catch (error) {
      setLoading(false);
      notifications.show({ message: 'Error fetching data:' + error , color: 'red' });
    }
  };
  // ------------------- feetch agents -------------------



  // 
  const handleDelete = async (id) => {
    try {
      const response = await agents.delete(id);
  
      // Adjust pagination or fetch agents based on current conditions
      if (elements.length === 1 && activePage > 1) {
        setActivePage(activePage - 1);
      } else if (elements.length === 1 && activePage === 1) {
        feetchAgents(1); // Refresh the first page
        setActivePage(1);
      } else {
        setElements(elements.filter(el => el.id !== id)); // Remove the deleted element from the list
      }
  
      // Show success notification
      notifications.show({ message: response.data.message, color: 'green' });
    } catch (error) {
      // Show error notification
      notifications.show({ message: error.response?.data?.message || 'An error occurred', color: 'red' });
    }
  };
  
  






  // ------------- when page mounted , or activePag , search changed -------------
  useEffect(() => {
    feetchAgents(activePage);
  }, [activePage, search]);
  // ------------- when page mounted , or activePag , search changed -------------




  const rows = elements.map((row) => {
    const totalOrders = row.Orders.retour + row.Orders.livré;
    const livréOrders = (row.Orders.livré / totalOrders) * 100;
    const retourOrders = (row.Orders.retour / totalOrders) * 100;
  
    return (
      <Table.Tr key={row.id}>
        <Table.Td>
          <Anchor component="button" fz="sm">
            {row.name}
          </Anchor>
        </Table.Td>
        <Table.Td>{Intl.NumberFormat().format(totalOrders)}</Table.Td>
        <Table.Td>
          <Anchor component="button" fz="sm">
            {row.email}
          </Anchor>
        </Table.Td>
        <Table.Td>
          <Group justify="space-between">
            <Text fz="xs" c="teal" fw={700}>
              {livréOrders.toFixed(0)}%
            </Text>
            <Text fz="xs" c="red" fw={700}>
              {retourOrders.toFixed(0)}%
            </Text>
          </Group>
          <Progress.Root>
            <Progress.Section value={livréOrders} color="teal" />
            <Progress.Section value={retourOrders} color="red" />
          </Progress.Root>
        </Table.Td>

        <Table.Td>
          <Group gap={0} justify="flex-end">
            <ActionIcon variant="subtle" color="gray" >
              <IconPencil style={{ width: '16px', height: '16px' }} stroke={1.5} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="red" >
              <IconTrash style={{ width: '16px', height: '16px' }} stroke={1.5} onClick={()=>{ handleDelete(row.id) }} />
            </ActionIcon>
          </Group>
        </Table.Td>

      </Table.Tr>
    );
  });




  const renderSkeletons = () =>
    Array.from({ length: 5 }).map((_, index) => (
      <Table.Tr key={index}>
        <Table.Td style={{ width: "30%" }}>
          <Group style={{ alignItems: "center" }}>
            <Skeleton height={16} width="70%" />
          </Group>
        </Table.Td>
        <Table.Td style={{ width: "20%" }}>
          <Skeleton height={16} width="40%" />
        </Table.Td>
        <Table.Td style={{ width: "30%" }}>
          <Skeleton height={16} width="60%" />
        </Table.Td>
        <Table.Td style={{ width: "30%" }}>
          <Group style={{ alignItems: "center" }}>
            <Skeleton height={16} width="70%" />
          </Group>
        </Table.Td>
        <Table.Td style={{ width: "20%" }}>
          <Group justify="flex-end" spacing="xs">
            <Skeleton circle height={24} width={24} />
            <Skeleton circle height={24} width={24} />
          </Group>
        </Table.Td>
      </Table.Tr>
    ));


  return (
    <>
      <Text fw={700} fz="xl" mb="md">
        Agents Management
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 1 }} spacing="lg">
        {/* Actions Section */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
          
          <Paper style={styleCard}>
            <Flex gap="sm" align="center">
              <Button onClick={CreateUserModal} fullWidth variant="filled" color="blue" >
                Add New Agent
              </Button>
              <Button fullWidth variant="outline">
                Export Data
              </Button>
            </Flex>
          </Paper>

          <div></div>
          {/* Search Section */}
          
          <Paper style={styleCard}>
            <form style={{ width: '100%' }} onSubmit={form.onSubmit(handleSearch)}>
              <TextInput
                size="sm"
                radius="md"
                placeholder="Search for agents..."
                rightSectionWidth={42}
                leftSection={<IconSearch size={18} stroke={1.5} />}
                {...form.getInputProps('search')}
                rightSection={
                  <ActionIcon size={28} radius="xl" variant="filled" type="submit">
                    <IconArrowRight size={18} stroke={1.5} />
                  </ActionIcon>
                }
              />
            </form>
          </Paper>
          
        </SimpleGrid>

            {
              loading ? (
                <Table.ScrollContainer style={styleCard} minWidth={800}>
                  <Table striped highlightOnHover verticalSpacing="xs">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Total Orders</Table.Th>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Orders Percentage</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {renderSkeletons()} {/* Call the renderSkeletons function */}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              ) : elements.length > 0 ? (
              <>
              <Table.ScrollContainer style={styleCard} minWidth={800}>
                  <Table striped highlightOnHover verticalSpacing="xs">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Total Orders</Table.Th>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Orders Percentage</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody height={80}>
                      { rows } 
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
              </>
              ): (
          ( (search.length > 0 && elements.length === 0) || (search.length === 0 && elements.length === 0)) && (
              <>
                <Table.ScrollContainer style={styleCard} minWidth={800}>
                  <Table striped highlightOnHover verticalSpacing="xs">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Name</Table.Th>
                        <Table.Th>Total Orders</Table.Th>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Orders Percentage</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                  </Table>
                  <div 
                    style={{ 
                      backgroundColor: '#dfdddd4c', 
                      height: '500px', 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      borderRadius:'2px'
                    }}
                  >
                    <Text 
                      size="lg" 
                      weight={500} 
                      style={{ color: '#7d7d7d' }}
                    >
                      No results found. Try adjusting your search criteria.
                    </Text>
                  </div>
                </Table.ScrollContainer>
              </>
            )
          )
              
            }


        {/* Pagination Section */}
          <Paper style={{ padding: '20px', margin: '20px 0' }}>
              <Group position="center">
                <Pagination
                  total={totalPages}
                  page={activePage}
                  onChange={setActivePage} // Update active page on click
                  size="sm"
                />
              </Group>
            </Paper>


        </SimpleGrid>



    </>
  );
}
