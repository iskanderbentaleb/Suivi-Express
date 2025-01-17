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
  PasswordInput
} from '@mantine/core';
import { IconSearch, IconArrowRight, IconTrash, IconPencil, IconUserPlus } from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { agents } from '../../../../services/api/admin/agents';





export default function Index() {
  const [activePage, setActivePage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [elements, setElements] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [Rerender, setRerender] = useState(false);





  const formSearch = useForm({
    initialValues: { search: '' },
  });


  const styleCard = {
    background: 'white',
    borderRadius: rem(8),
    padding: rem(10),
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  };






  // ------------------ update Agent : id ----------------------
  const UpdateAgentForm = ({ closeModal , id }) => {

    const Agent = elements.find((element) => element.id === id);

    const formCreate = useForm({
      initialValues: {
        name: Agent.name,
        email: Agent.email
      },
      validate: {
        name: (value) =>
          value.length < 3 ? 'Name must have at least 3 letters' : null,
        email: (value) =>
          /^\S+@\S+$/.test(value) ? null : 'Invalid email address',
      },
    });
  
    const handleSubmit = async (values) => {
      try {
        // Make API call to create the agent
        const { data } = await agents.update(id , values);
    
        console.log(data);
        setRerender(!Rerender);
        // Show success notification
        notifications.show({
          message: 'Agent updated successfully!',
          color: 'green',
        });
    
        // Reset form and close modal on success
        formCreate.reset();
        closeModal();
      } catch (error) {
        // Log the error for debugging
        console.error('Error updating agent:', error);
    
        // Display failure notification
        notifications.show({
          message: error?.response?.data?.message || 'Failed to update agent. Please try again.',
          color: 'red',
        });
      }
    };
    
  
    const handleError = (errors) => {
      // console.log('Validation errors:', errors);
      notifications.show({
        message: 'Please fix the validation errors before submitting.',
        color: 'red',
      });
    };
  
    return (
      <form onSubmit={formCreate.onSubmit(handleSubmit, handleError)}>
        
        <TextInput
          label="Name"
          withAsterisk
          mt="sm"
          placeholder="example"
          data-autofocus
          {...formCreate.getInputProps('name')}
        />

        <TextInput
          label="Email"
          withAsterisk
          mt="sm"
          placeholder="example@example.com"
          {...formCreate.getInputProps('email')}
        />

        <Button type="submit" fullWidth mt="md">
          Update
        </Button>

        <Button
          fullWidth
          mt="md"
          variant="outline"
          onClick={closeModal}
        >
          Cancel
        </Button>
      </form>
    );
  };
  
  const UpdateAgentModal = (id) => {
    modals.open({
      title: 'Update Agent',
      centered: true,
      children: (
        <UpdateAgentForm id={id} closeModal={() => modals.closeAll()} />
      ),
    });
  };
  // ------------------ update Agent : id ----------------------





  // ------------------ create New Agent ----------------------
  const CreateAgentForm = ({ closeModal }) => {
    const formCreate = useForm({
      initialValues: {
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
      },
      validate: {
        name: (value) =>
          value.length < 3 ? 'Name must have at least 3 letters' : null,
        email: (value) =>
          /^\S+@\S+$/.test(value) ? null : 'Invalid email address',
        password: (value) =>
          value.length < 6 ? 'Password must be at least 6 characters' : null,
        password_confirmation: (value, values) =>
          value !== values.password ? 'Passwords do not match' : null,
      },
    });
  
    const handleSubmit = async (values) => {
      try {
        // Make API call to create the agent
        const { data } = await agents.post(values);
    
        console.log(data);
        setRerender(!Rerender);
        // Show success notification
        notifications.show({
          message: 'Agent created successfully!',
          color: 'green',
        });
    
        // Reset form and close modal on success
        formCreate.reset();
        closeModal();
      } catch (error) {
        // Log the error for debugging
        console.error('Error creating agent:', error);
    
        // Display failure notification
        notifications.show({
          message: error?.response?.data?.message || 'Failed to create agent. Please try again.',
          color: 'red',
        });
      }
    };
    
  
    const handleError = (errors) => {
      // console.log('Validation errors:', errors);
      notifications.show({
        message: 'Please fix the validation errors before submitting.',
        color: 'red',
      });
    };
  
    return (
      <form onSubmit={formCreate.onSubmit(handleSubmit, handleError)}>
        <TextInput
          label="Name"
          withAsterisk
          mt="sm"
          placeholder="example"
          data-autofocus
          {...formCreate.getInputProps('name')}
        />
        <TextInput
          label="Email"
          withAsterisk
          mt="sm"
          placeholder="example@example.com"
          {...formCreate.getInputProps('email')}
        />
        <PasswordInput
          label="Password"
          withAsterisk
          type="password"
          mt="sm"
          placeholder="Enter password"
          {...formCreate.getInputProps('password')}
        />
        <PasswordInput
          label="Password Confirmation"
          withAsterisk
          type="password"
          mt="sm"
          placeholder="Confirm password"
          {...formCreate.getInputProps('password_confirmation')}
        />
        <Button type="submit" fullWidth mt="md">
          Submit
        </Button>
        <Button
          fullWidth
          mt="md"
          variant="outline"
          onClick={closeModal}
        >
          Cancel
        </Button>
      </form>
    );
  };
  
  const CreateAgentModal = () => {
    modals.open({
      title: 'Create New Agent',
      centered: true,
      children: (
        <CreateAgentForm closeModal={() => modals.closeAll()} />
      ),
    });
  };
  // ------------------ create New Agent ----------------------







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
        // console.log(data.data)
        setElements(data.data);
        setTotalPages(data.meta.last_page || 1); // Update total pages
        setLoading(false);
      } catch (error) {
        setLoading(false);
        notifications.show({ message: 'Error fetching data:' + error , color: 'red' });
      }
    };
  // ------------------- feetch agents -------------------


    // --------------------- export agents ---------------------  
    const exportAgents = async () => {
      try {
          const response = await agents.exportAgent();
          // Create a URL for the downloaded file
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'agents.xlsx');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } catch (error) {
          console.error('Error exporting agents:', error);
      }
  };
  // --------------------- export agents --------------------- 





  // --------------------- delete actions --------------------- 
  const DeleteAgentModal = (id) => modals.openConfirmModal({
    title: 'Confirm Deletion',
    centered: true,
    children: (
      <Text size="sm">
        Are you sure you want to delete this agent? <br />
        NOTE : This action cannot be undone.
      </Text>
    ),
    labels: { confirm: 'Confirm', cancel: 'Cancel' },
    onCancel: () => console.log('Cancel'),
    onConfirm: () => {
      handleDelete(id);
    },
  });
  

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
  // --------------------- delete actions --------------------- 
   






  // ------------- when page mounted , or activePag , search changed -------------
  useEffect(() => {
    feetchAgents(activePage);
  }, [activePage, search , Rerender]);
  // ------------- when page mounted , or activePag , search changed -------------



  //---------------- data of agent ---------------------
    const rows = elements.map((row) => {
    const totalOrders = row.Orders.retour + row.Orders.livré;
    const livréOrders = (row.Orders.livré / totalOrders) * 100;
    const retourOrders = (row.Orders.retour / totalOrders) * 100;
  
    return (
      <Table.Tr key={row.id}>
        <Table.Td>
          <Anchor component="button" fz="sm">
          {row.id + ' / '} {row.name}
          </Anchor>
        </Table.Td>
        <Table.Td>{Intl.NumberFormat().format(row.Orders.orders_count)}</Table.Td>
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
            <ActionIcon variant="subtle" color="gray" onClick={()=>{ UpdateAgentModal(row.id) }}>
              <IconPencil style={{ width: '16px', height: '16px' }} stroke={1.5} />
            </ActionIcon>
            <ActionIcon variant="subtle" color="red" onClick={()=>{ DeleteAgentModal(row.id) }}>
              <IconTrash style={{ width: '16px', height: '16px' }} stroke={1.5}  />
            </ActionIcon>
          </Group>
        </Table.Td>

      </Table.Tr>
    );
  });
  //---------------- data of agent ---------------------




  // -------------- before load data from api -----------------
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
          <Group justify="flex-end"  spacing="xs" style={{ flexWrap: 'nowrap' }}>
            <Skeleton circle height={24} width={24} />
            <Skeleton circle height={24} width={24} />
          </Group>
        </Table.Td>
      </Table.Tr>
  ));
  // -------------- before load data from api -----------------


  return (
    <>
      <Text fw={700} fz="xl" mb="md">
        Agents Management
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 1 }} spacing="lg">
        {/* Actions Section */}
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          
          <Paper style={styleCard}>
            <Flex gap="sm" align="center">
              <Button onClick={CreateAgentModal} fullWidth variant="filled" color="blue" >
                <IconUserPlus stroke={2} />
              </Button>
              <Button onClick={exportAgents} fullWidth variant="outline">
                Export
              </Button>
            </Flex>
          </Paper>




          {/* Search Section */}          
          <Paper style={styleCard}>
            <form style={{ width: '100%' }} onSubmit={formSearch.onSubmit(handleSearch)}>
              <TextInput
                size="sm"
                radius="md"
                placeholder="Search for agents..."
                rightSectionWidth={42}
                leftSection={<IconSearch size={18} stroke={1.5} />}
                {...formSearch.getInputProps('search')}
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
                        <Table.Th>Id/Name</Table.Th>
                        <Table.Th>Total Orders</Table.Th>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Delivery Rate</Table.Th>
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
                        <Table.Th>Id/Name</Table.Th>
                        <Table.Th>Total Orders</Table.Th>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Delivery Rate</Table.Th>
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
                        <Table.Th>Id/Name</Table.Th>
                        <Table.Th>Total Orders</Table.Th>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Delivery Rate</Table.Th>
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
          <Paper style={styleCard}>
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
