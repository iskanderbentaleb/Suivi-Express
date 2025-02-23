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
  const UpdateAgentForm = ({ closeModal, id }) => {
    const Agent = elements.find((element) => element.id === id);
  
    const formCreate = useForm({
      initialValues: {
        name: Agent.name,
        email: Agent.email,
      },
      validate: {
        name: (value) =>
          value.length < 3 ? 'Le nom doit comporter au moins 3 lettres' : null,
        email: (value) =>
          /^\S+@\S+$/.test(value) ? null : 'Adresse e-mail invalide',
      },
    });
  
    const handleSubmit = async (values) => {
      try {
        // Make API call to update the agent
        const { data } = await agents.update(id, values);
  
        console.log(data);
        setRerender(!Rerender);
        // Show success notification
        notifications.show({
          message: 'Agent mis à jour avec succès !',
          color: 'green',
        });
  
        // Reset form and close modal on success
        formCreate.reset();
        closeModal();
      } catch (error) {
        // Log the error for debugging
        console.error('Erreur lors de la mise à jour de l\'agent :', error);
  
        // Display failure notification
        notifications.show({
          message: error?.response?.data?.message || 'Échec de la mise à jour de l\'agent. Veuillez réessayer.',
          color: 'red',
        });
      }
    };
  
    const handleError = (errors) => {
      notifications.show({
        message: 'Veuillez corriger les erreurs de validation avant de soumettre.',
        color: 'red',
      });
    };
  
    return (
      <form onSubmit={formCreate.onSubmit(handleSubmit, handleError)}>
        <TextInput
          label="Nom"
          withAsterisk
          mt="sm"
          placeholder="exemple"
          data-autofocus
          {...formCreate.getInputProps('name')}
        />
  
        <TextInput
          label="E-mail"
          withAsterisk
          mt="sm"
          placeholder="exemple@exemple.com"
          {...formCreate.getInputProps('email')}
        />
  
        <Button type="submit" fullWidth mt="md">
          Mettre à jour
        </Button>
  
        <Button fullWidth mt="md" variant="outline" onClick={closeModal}>
          Annuler
        </Button>
      </form>
    );
  };
  
  const UpdateAgentModal = (id) => {
    modals.open({
      title: 'Mettre à jour l\'agent',
      centered: true,
      children: <UpdateAgentForm id={id} closeModal={() => modals.closeAll()} />,
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
          value.length < 3 ? 'Le nom doit comporter au moins 3 lettres' : null,
        email: (value) =>
          /^\S+@\S+$/.test(value) ? null : 'Adresse e-mail invalide',
        password: (value) =>
          value.length < 6 ? 'Le mot de passe doit comporter au moins 6 caractères' : null,
        password_confirmation: (value, values) =>
          value !== values.password ? 'Les mots de passe ne correspondent pas' : null,
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
          message: 'Agent créé avec succès !',
          color: 'green',
        });
  
        // Reset form and close modal on success
        formCreate.reset();
        closeModal();
      } catch (error) {
        // Log the error for debugging
        console.error('Erreur lors de la création de l\'agent :', error);
  
        // Display failure notification
        notifications.show({
          message: error?.response?.data?.message || 'Échec de la création de l\'agent. Veuillez réessayer.',
          color: 'red',
        });
      }
    };
  
    const handleError = (errors) => {
      notifications.show({
        message: 'Veuillez corriger les erreurs de validation avant de soumettre.',
        color: 'red',
      });
    };
  
    return (
      <form onSubmit={formCreate.onSubmit(handleSubmit, handleError)}>
        <TextInput
          label="Nom"
          withAsterisk
          mt="sm"
          placeholder="exemple"
          data-autofocus
          {...formCreate.getInputProps('name')}
        />
        <TextInput
          label="E-mail"
          withAsterisk
          mt="sm"
          placeholder="exemple@exemple.com"
          {...formCreate.getInputProps('email')}
        />
        <PasswordInput
          label="Mot de passe"
          withAsterisk
          type="password"
          mt="sm"
          placeholder="Entrez un mot de passe"
          {...formCreate.getInputProps('password')}
        />
        <PasswordInput
          label="Confirmation du mot de passe"
          withAsterisk
          type="password"
          mt="sm"
          placeholder="Confirmez le mot de passe"
          {...formCreate.getInputProps('password_confirmation')}
        />
        <Button type="submit" fullWidth mt="md">
          Soumettre
        </Button>
        <Button fullWidth mt="md" variant="outline" onClick={closeModal}>
          Annuler
        </Button>
      </form>
    );
  };
  
  const CreateAgentModal = () => {
    modals.open({
      title: 'Créer un nouvel agent',
      centered: true,
      children: <CreateAgentForm closeModal={() => modals.closeAll()} />,
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
        notifications.show({ message: 'Erreur lors de la récupération des données:' + error , color: 'red' });
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
          console.error("Erreur lors de l'exportation des agents:", error);
      }
  };
  // --------------------- export agents --------------------- 





  // --------------------- delete actions --------------------- 
  const DeleteAgentModal = (id) => modals.openConfirmModal({
    title: 'Confirmer la suppression',
    centered: true,
    children: (
      <Text size="sm">
        Êtes-vous sûr de vouloir supprimer cet agent ? <br />
        REMARQUE : Cette action est irréversible.
      </Text>
    ),
    labels: { confirm: 'Confirmer', cancel: 'Annuler' },
    onCancel: () => console.log('Annulation'),
    onConfirm: () => {
      handleDelete(id);
    },
  });
  
  const handleDelete = async (id) => {
    try {
      const response = await agents.delete(id);
  
      // Ajuster la pagination ou récupérer les agents en fonction des conditions actuelles
      if (elements.length === 1 && activePage > 1) {
        setActivePage(activePage - 1);
      } else if (elements.length === 1 && activePage === 1) {
        feetchAgents(1); // Actualiser la première page
        setActivePage(1);
      } else {
        setElements(elements.filter(el => el.id !== id)); // Supprimer l'élément supprimé de la liste
      }
  
      // Afficher une notification de succès
      notifications.show({ message: response.data.message, color: 'green' });
    } catch (error) {
      // Afficher une notification d'erreur
      notifications.show({ message: error.response?.data?.message || 'Une erreur s’est produite', color: 'red' });
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
            {row.name}
        </Table.Td>
        <Table.Td>{Intl.NumberFormat().format(row.Orders.orders_count)}</Table.Td>
        <Table.Td>
            {row.email}
        </Table.Td>
        <Table.Td style={{color:'white' , background:'teal'}}>
            {row.Orders.livré}
        </Table.Td>
        <Table.Td style={{color:'white' , background:'red'}}>
            {row.Orders.retour}
        </Table.Td>
        <Table.Td>
          <Group justify="space-between">
            <Text fz="xs" c="teal.6" fw={700}>
              {livréOrders.toFixed(0)}%
            </Text>
            <Text fz="xs" c="red.6" fw={700}>
              {retourOrders.toFixed(0)}%
            </Text>
          </Group>
          <Progress.Root>
            <Progress.Section value={livréOrders} color="teal.6" />
            <Progress.Section value={retourOrders} color="red.6" />
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
          <Skeleton height={16} width="60%" />
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
        Gestion des agents
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 1 }} spacing="lg">
        {/* Actions Section */}
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
          
          <Paper style={styleCard}>
            <Flex gap="sm" align="center">
              <Button onClick={CreateAgentModal} fullWidth variant="filled" color="blue">
                <IconUserPlus stroke={2} />
              </Button>
              <Button onClick={exportAgents} fullWidth variant="outline">
                Exporter
              </Button>
            </Flex>
          </Paper>



          {/* Search Section */}          
          <Paper style={styleCard}>
            <form style={{ width: '100%' }} onSubmit={formSearch.onSubmit(handleSearch)}>
              <TextInput
                size="sm"
                radius="md"
                placeholder="Rechercher des agents..."
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
                        <Table.Th>Nom</Table.Th>
                        <Table.Th>Total des commandes</Table.Th>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Total des commandes livrées</Table.Th>
                        <Table.Th>Total des commandes retournées</Table.Th>
                        <Table.Th>Taux de livraison</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {renderSkeletons()} {/* Appel de la fonction renderSkeletons */}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>

              ) : elements.length > 0 ? (
              <>
                <Table.ScrollContainer style={styleCard} minWidth={800}>
                  <Table striped highlightOnHover verticalSpacing="xs">
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Nom</Table.Th>
                        <Table.Th>Total des commandes</Table.Th>
                        <Table.Th>Email</Table.Th>
                        <Table.Th>Total des commandes livrées</Table.Th>
                        <Table.Th>Total des commandes retournées</Table.Th>
                        <Table.Th>Taux de livraison</Table.Th>
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
                      <Table.Th>Nom</Table.Th>
                      <Table.Th>Total des commandes</Table.Th>
                      <Table.Th>Email</Table.Th>
                      <Table.Th>Total des commandes livrées</Table.Th>
                      <Table.Th>Total des commandes retournées</Table.Th>
                      <Table.Th>Taux de livraison</Table.Th>
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
                    borderRadius: '2px'
                  }}
                >
                  <Text 
                    size="lg" 
                    weight={500} 
                    style={{ color: '#7d7d7d' }}
                  >
                    Aucun résultat trouvé. Essayez d'ajuster vos critères de recherche.
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
