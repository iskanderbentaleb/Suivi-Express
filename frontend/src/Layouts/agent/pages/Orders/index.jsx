import {
    Group,
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
    CopyButton,
    Tooltip,
    NativeSelect,
    Timeline,
    Avatar,
    Textarea,
    Loader,
    Center,
    Badge,
    ThemeIcon,
  } from '@mantine/core';
  import { IconSearch, IconArrowRight, IconPencil, IconCheck, IconCopy, IconHistory, IconList, IconPackage, IconUnlink, IconLinkOff, IconArchive, IconRosetteDiscountCheck} from '@tabler/icons-react';
  import { useForm } from '@mantine/form';
  import { modals } from '@mantine/modals';
  import { notifications } from '@mantine/notifications';
  import { useEffect, useState } from 'react';
  import { orders } from '../../../../services/api/agent/orders';
  import { useUserContext } from "../../../../context/UserContext";
  import { statusOrders } from '../../../../services/api/agent/statusOrders';
  import '@mantine/dropzone/styles.css';
import { historyOrders } from '../../../../services/api/agent/historyOrders';
  
  
  
  export default function Index() {

    const { user } = useUserContext() ;


    const [loadingExport, setLoadingExport] = useState(false);
    const [activePage, setActivePage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [elements, setElements] = useState([]);
    const [StatusOrdersdata, setStatusOrdersdata] = useState([]);
    const [StatusOrderIndex, setStatusOrderIndex] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [Rerender, setRerender] = useState(false);
    const [TaskOrder, setTaskOrder] = useState(true); // true = orders / false=tasks
  
  
  
  
  
    const formSearch = useForm({
      initialValues: { search: '' },
    });
  
  
    const styleCard = {
      background: 'white',
      borderRadius: rem(8),
      padding: rem(10),
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    };
  
  
  



    //------------- filter between task today , and all order -------------
    const changeOrderTask = () =>{
      setTaskOrder(!TaskOrder);
      if(TaskOrder){
        feetchTaskToday(); // feetch task today orders
      }else{
        feetchOrders(); // feetch orders
      }
    }
    //------------- filter between task today , and all order -------------
    





  
  
    // ------------------ update Agent : id ----------------------
    const UpdateOrderForm = ({ closeModal, id }) => {
      // Récupérer les données de la commande en fonction de l'ID fourni
      const order = elements.find((element) => element.id === id);
    
      // Initialiser le formulaire avec les données existantes du client
      const formCreate = useForm({
        initialValues: {
          client_name: order?.client_name || '',
          client_lastname: order?.client_lastname || '',
          phone: order?.phone || '',
          product_url: order?.product_url || '',
        },
        validate: {
          client_name: (value) =>
            value.trim().length === 0
              ? "Le prénom du client est requis"
              : value.trim().length < 3
              ? "Le prénom doit contenir au moins 3 caractères"
              : null,
          client_lastname: (value) =>
            value.trim().length > 0 && value.trim().length < 3
              ? "Le nom doit contenir au moins 3 caractères"
              : null,
          phone: (value) =>
            value.trim().length === 0
              ? "Le numéro de téléphone est requis"
              : value.trim().length > 50
              ? "Le numéro de téléphone ne doit pas dépasser 50 caractères"
              : !/^[\d\s+-]+$/.test(value)
              ? "Le numéro de téléphone contient des caractères invalides"
              : null,
          product_url: (value) =>
            value.trim().length > 0 && value.trim().length < 5
              ? "L'URL du produit doit contenir au moins 3 caractères"
              : null, // Champ facultatif, donc pas d'erreur si vide
        },
      });
    
      const handleSubmit = async (values) => {
        try {
          // Appel API pour mettre à jour la commande
          const { data } = await orders.update(id, values);
          console.log(data);
          setRerender(!Rerender);
          // Notification de succès
          notifications.show({
            message: "Commande mise à jour avec succès !",
            color: "green",
          });
    
          // Réinitialiser le formulaire et fermer la modal après mise à jour
          formCreate.reset();
          closeModal();
        } catch (error) {
          // Affichage de l'erreur en cas d'échec
          console.error("Erreur lors de la mise à jour :", error);
    
          // Notification d'échec
          notifications.show({
            message: error?.response?.data?.message || "Échec de la mise à jour. Veuillez réessayer.",
            color: "red",
          });
        }
      };
    
      const handleError = (errors) => {
        notifications.show({
          message: "Veuillez corriger les erreurs de validation avant de soumettre.",
          color: "red",
        });
      };
    
      return (
        <form onSubmit={formCreate.onSubmit(handleSubmit, handleError)}>
          {/* Société de livraison */}
          <TextInput
            disabled
            label="Société de livraison"
            mt="sm"
            placeholder=""
            value={order?.delivery_company.name}
          />
    
          {/* Suivi */}
          <TextInput disabled label="tracking" mt="sm" value={order?.tracking} />
    
          {/* ID Externe */}
          <TextInput disabled label="ID Externe" withAsterisk mt="sm" placeholder="web5010" value={order?.external_id} />
    
          {/* Prénom du client */}
          <TextInput
            label="Prénom du client"
            withAsterisk
            mt="sm"
            placeholder="Prénom"
            {...formCreate.getInputProps("client_name")}
          />
    
          {/* Nom du client */}
          <TextInput label="Nom du client" mt="sm" placeholder="Nom" {...formCreate.getInputProps("client_lastname")} />
    
          {/* Téléphone du client */}
          <TextInput
            label="Téléphone du client"
            withAsterisk
            mt="sm"
            placeholder="0501010011"
            {...formCreate.getInputProps("phone")}
          />
    
          {/* URL du produit */}
          <TextInput label="URL du produit" mt="sm" placeholder="URL du produit" {...formCreate.getInputProps("product_url")} />
    
          {/* Bouton de soumission */}
          <Button type="submit" fullWidth mt="md">
            Mettre à jour
          </Button>
    
          {/* Bouton d'annulation */}
          <Button fullWidth mt="md" variant="outline" onClick={closeModal}>
            Annuler
          </Button>
        </form>
      );
    };
    
    const UpdateOrderModal = (id) => {
      modals.open({
        title: "Mettre à jour la commande",
        centered: true,
        children: <UpdateOrderForm id={id} closeModal={() => modals.closeAll()} />,
      });
    };
    
    // ------------------ update Agent : id ----------------------
  

  
  
  
  
  
  
    // --------------- search agents --------------------
    const handleSearch = (values) => {
        const trimmedSearch = values.search.trim().toLowerCase();
        if (trimmedSearch !== search) {
          setSearch(trimmedSearch);
          setRerender(!Rerender);
          setActivePage(1);
        }
    };
    // --------------- search agents --------------------
  
  
  
    // ------------------- feetch task today -------------------
    const feetchTaskToday = async (page = 1) => {
      setLoading(true);
      try {
        const { data } = await orders.tasktoday(page, search);
        // console.log(data.data)
        setElements(data.data);
        setTotalPages(data.meta.last_page || 1); // Update total pages
        setLoading(false);
      } catch (error) {
        setLoading(false);
        notifications.show({ message: 'Erreur lors de la récupération des commandes :' + error , color: 'red' });
      }
    };
    // ------------------- feetch task today  -------------------
    

  
    // ------------------- feetch agents -------------------
    const feetchOrders = async (page = 1) => {
        setLoading(true);
        try {
          const { data } = await orders.index(page, search);
          // console.log(data.data)
          setElements(data.data);
          setTotalPages(data.meta.last_page || 1); // Update total pages
          setLoading(false);
        } catch (error) {
          setLoading(false);
          notifications.show({ message: 'Erreur lors de la récupération des commandes :' + error , color: 'red' });
        }
    };
    // ------------------- feetch agents -------------------
  

    // ------------------- export orders -------------------
    const exportOrders = async () => {
      setLoadingExport(true);
      try {
          const response = await orders.exportOrders();
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'commandes.xlsx');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setLoadingExport(false);
      } catch (error) {
          console.error("Erreur lors de l'exportation des commandes :", error);
          setLoadingExport(false);
      }
    };
    // ------------------- export orders -------------------
  

  
  

  
  // ------------------ get status order ----------------------
  const getStatusOrders = async () => {
    setLoading(true); // Démarre le chargement
    try {
      const response = await statusOrders.index(); // Récupère les données des statuts de commande
      const statusOrdersdata = response.data.map((status) => ({
        value: status.id.toString(), // Utilise l'`id` comme valeur
        label: status.status,         // Utilise le `statut` comme libellé
        colorHex: status.colorHex,    // Utilise le code couleur hexadécimal
      }));
      setStatusOrdersdata(statusOrdersdata); // Met à jour les données des statuts de commande
  
      const filteredStatusOrders = statusOrdersdata.map((item) => ({
        value: item.value, // Garde la valeur d'origine
        label: item.label, // Garde le libellé d'origine
        disabled: item.label === "Tentative échouée" || item.label === "En attente du client" || item.label === "Échec livraison", // Désactive certains éléments spécifiques
      }));
      setStatusOrderIndex(filteredStatusOrders); // Met à jour les statuts de commande filtrés
  
    } catch (error) {
      notifications.show({ message: 'Erreur lors de la récupération des données des statuts de commande : ' + error , color: 'red' }); // Affiche une notification d'erreur
    }
  };
  // ------------------ get status order  ----------------------







  // ------------------ update status order  -------------------
  const UpdateOrderStatus = async (orderId, statusId) => {
    try {
      // Étape 1 : Mettre à jour le statut de la commande
      const updateStatusRequest = orders.updateStausOrder(orderId, { statusId });
  
      // Étape 2 : Créer un nouvel historique de commande avec status_order_id, history_judge = false, et order_id
      const historyData = {
        status_order_id: statusId, // ID du statut de la commande
        order_id: orderId,         // ID de la commande
        history_judge: false,     // Jugement de l'historique (faux par défaut)
        note: "Statut de la commande mis à jour", // Optionnel : Vous pouvez ajouter des notes supplémentaires ici
        timetook: "00:00:00",      // Optionnel : Si vous souhaitez définir un temps, ajustez en conséquence
      };
  
      const createHistoryRequest = historyOrders.post(historyData);
  
      // Attendre que les deux requêtes aboutissent
      const [statusData, historyDataResponse] = await Promise.all([updateStatusRequest, createHistoryRequest]);
  
      // Si les deux requêtes réussissent, déclencher un re-rendu
      console.log(statusData);
      console.log(historyDataResponse);
  
      // Étape 3 : Déclencher un re-rendu (en supposant que vous souhaitez rafraîchir l'état de l'interface utilisateur)
      setRerender(!Rerender);
  
      // Afficher une notification de succès
      notifications.show({
        message: 'Statut de la commande mis à jour et historique créé avec succès !',
        color: 'green',
      });
      
    } catch (error) {
      // Gérer l'erreur et afficher une notification
      notifications.show({
        message: `Échec de la mise à jour du statut de la commande ou de la création de l'historique : ${error.message}`,
        color: 'red',
      });
    }
  };
  // ------------------ update status order  -------------------
  
  



  // ------------------ Call Model ----------------------
  const CallModelComponent = ({ closeModal, id }) => {
    const [history, setHistory] = useState([]); // Historique des commandes
    const [reasonCalls, setReasonCalls] = useState([]); // Raisons d'appel
    const [loadingHistory, setLoadingHistory] = useState(false); // État de chargement
    const [statusOrder, setStatusOrder] = useState([]); // Statuts de commande
    const [selectedStatus, setSelectedStatus] = useState(''); // Statut sélectionné

    // Initialisation du formulaire
    const formCreate = useForm({
      initialValues: {
        status_order_id: '', // ID du statut de la commande
        reason_id: '',       // ID de la raison d'appel
        note: '',            // Note de l'agent
        history_judge: true, // Jugement de l'historique
        order_id: id,         // ID de la commande
        timetook: "00:00:00", // Temps pris
      },
      validate: {
        status_order_id: (value) =>
          value.trim().length === 0 ? 'Le statut est requis' : null, // Validation du statut
        note: (value) =>
          value.trim().length < 2
            ? 'La note doit contenir au moins 2 caractères'
            : null, // Validation de la note
      },
    });

    // Récupérer l'historique des commandes
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const { data } = await orders.order_history(id);
        setHistory(data.data); // Utiliser la structure correcte de la réponse
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique des commandes :', error.message);
      } finally {
        setLoadingHistory(false);
      }
    };

    // Récupérer les raisons d'appel
    const fetchReasonscalls = async () => {
      setLoadingHistory(true);
      try {
        const response = await orders.ReasonsCall();
        const formattedData = response.data.map((item) => ({
          value: item.id.toString(), // Utiliser le champ correct pour la valeur
          label: item.reason,        // Utiliser le champ correct pour le libellé
        }));
        setReasonCalls(formattedData); // Mettre à jour l'état avec les données formatées
      } catch (error) {
        console.error('Erreur lors de la récupération des raisons d\'appel :', error.message);
      } finally {
        setLoadingHistory(false);
      }
    };

    // Gérer les données des statuts de commande (filtrées)
    const handleStatusOrdersData = () => {
      const filteredStatusOrders = StatusOrdersdata.filter(
        (item) =>
          item.label === "Tentative échouée" ||
          item.label === "En attente du client" ||
          item.label === "Échec livraison"
      );
    
      setStatusOrder((prevState) => [...prevState, ...filteredStatusOrders]);
    };

    // Soumettre le formulaire d'appel
    const handleSubmit = async (values) => {
      try {
        // Appel API pour ajouter un historique de commande
        await historyOrders.post(values);

        // Appel API pour mettre à jour le statut de la commande
        await orders.updateStausOrder(id, { statusId: values.status_order_id });
    
        // Afficher une notification de succès
        notifications.show({
          message: 'Historique de commande créé avec succès !',
          color: 'green',
        });
        
        setRerender(!Rerender); // Déclencher un re-rendu
    
        // Réinitialiser le formulaire et fermer la modal en cas de succès
        formCreate.reset();
        closeModal();
      } catch (error) {
        // Journaliser l'erreur pour le débogage
        console.error('Erreur lors de la création de la commande :', error);
    
        // Afficher une notification d'échec
        notifications.show({
          message: error?.response?.data?.message || 'Échec de la création de la commande. Veuillez réessayer.',
          color: 'red',
        });
      }
    };

    // Effet pour réinitialiser le champ "reason" lorsque le statut change
    useEffect(() => {
      console.log(selectedStatus);
      formCreate.setFieldValue('reason', '');
    }, [selectedStatus]);
    
    // Effet pour charger les données initiales
    useEffect(() => {
      handleStatusOrdersData();
      fetchReasonscalls();
      fetchHistory();
    }, []);

    return (
      <div>
        {loadingHistory ? (
          <Center style={{ height: '10vh' }}>
            <Loader color="blue" type="bars" /> {/* Afficher un indicateur de chargement */}
          </Center>
        ) : (
          <>
            <form onSubmit={formCreate.onSubmit(handleSubmit)}>
              {/* Sélection du statut de la commande */}
              <NativeSelect
                label="Statut de la commande"
                placeholder="Sélectionner un statut"
                withAsterisk
                data={[{ value: '', label: 'Sélectionner un statut', disabled: true }, ...statusOrder]} // Ajouter une option vide
                value={formCreate.values.status_order_id || ''} // Assurer que la valeur par défaut est une chaîne vide
                onChange={(event) => {
                  const selectedValue = event.currentTarget.value; // Obtenir la valeur sélectionnée
                  const selectedLabel = statusOrder.find((item) => item.value === selectedValue)?.label || ''; // Trouver le libellé correspondant

                  setSelectedStatus(selectedLabel); // Mettre à jour l'état du libellé
                  formCreate.setFieldValue('status_order_id', selectedValue); // Mettre à jour la valeur du champ du formulaire
                }}
              />

              {/* Raison (affiché uniquement pour certains statuts) */}
              {['Échec livraison', 'Tentative échouée'].includes(selectedStatus) && (
                <NativeSelect
                  label="Raison"
                  placeholder="Sélectionner une raison"
                  withAsterisk
                  data={reasonCalls} // Source de données pour la liste déroulante
                  value={formCreate.values.reason_id || ''} // Lier explicitement le champ du formulaire
                  onChange={(event) => formCreate.setFieldValue('reason_id', event.currentTarget.value)} // Mettre à jour la valeur du formulaire
                  mt="sm"
                />
              )}

              {/* Note de l'agent */}
              <Textarea
                label="Note"
                placeholder="Ajouter votre note ici..."
                withAsterisk
                mt="sm"
                {...formCreate.getInputProps('note')}
              />

              {/* Boutons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', whiteSpace: 'nowrap', marginTop: '1rem' }}>
                <Button fullWidth variant="outline" onClick={closeModal}>
                  Annuler
                </Button>
                <Button fullWidth type="submit">
                  Soumettre
                </Button>
              </div>
            </form>

            {/* Historique des commandes */}
            <div>
              <Paper withBorder radius="md" shadow="sm" p="xl" mt={20}>
                {history.length === 0 ? (
                  // Afficher ce message si l'historique est vide
                  <Text color="dimmed" size="sm" align="center">
                    Aucun historique pour le moment.
                  </Text>
                ) : (
                  // Afficher la timeline s'il y a des éléments dans l'historique
                  <Timeline radius={'sm'} lineWidth={0.5} bulletSize={35} active={history.length} style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                    {history.map((item) => (
                      <Timeline.Item
                        key={item.id}
                        title={
                          <Group spacing="sm">
                            <Text weight={700} size="lg">
                              {
                                item.status?.status ? 
                                  `${item.status.status}${item.reason?.reason ? ` (${item.reason.reason})` : ''}`
                                : 'Aucun statut fourni'
                              }
                            </Text>
                            <Text size="xs" color="dimmed">
                              {item.created_at}
                            </Text>
                          </Group>
                        }
                        bullet={
                            item.validator !== null || (item.validator === null && item.history_judge == false) ?
                            <>
                              <ThemeIcon>
                                <IconRosetteDiscountCheck size="18rem" />
                              </ThemeIcon>
                            </>
                            : null
                          }
                      >
                        <Group align="center" spacing="sm" mt="xs">
                          {
                            item.agent?.role === 'admin' ? (
                              <Avatar size={30} radius="sm" color="green">
                                {
                                  item.agent?.name
                                    ? item.agent.name.charAt(0).toUpperCase() + item.agent.name.charAt(item.agent.name.length - 1).toUpperCase()
                                    : ''
                                }
                              </Avatar>
                            ) : (
                              <Avatar size={30} radius="sm" color="blue">
                                {
                                  item.agent?.name
                                    ? item.agent.name.charAt(0).toUpperCase() + item.agent.name.charAt(item.agent.name.length - 1).toUpperCase()
                                    : ''
                                }
                              </Avatar>
                            )
                          }
                          <Text weight={500} size="md">
                            {item.agent?.name || 'Agent inconnu'}
                          </Text>
                            {
                              (
                                 item.history_judge == true && item.validator !== null ? 
                                    (
                                      <Badge variant="light" color="green" radius="sm">Validé par : {item.validator?.name}</Badge>
                                    )
                                  : item.history_judge == true ?
                                  (
                                      <Badge variant="light" color="yellow" radius="sm">Validation en attente...</Badge>
                                  ) : null
                              )
                            }
                        </Group>

                        {
                          item.history_judge == true ? (
                            <>
                              <Text color="dimmed" size="sm" mt="xs">
                                {item.note || 'Aucune note supplémentaire disponible'}
                              </Text>
                            </>
                          ) : null
                        }
                      </Timeline.Item>
                    ))}
                  </Timeline>
                )}
              </Paper>
            </div>
          </>
        )}
      </div>
    );
  };

  // Composant pour ouvrir la modal
  const CallModal = (id) => {
    modals.open({
      title: 'Historique de la commande',
      centered: true,
      children: (
        <CallModelComponent closeModal={() => modals.closeAll()} id={id} />
      ),
    });
  };
  // ------------------ Call Model ----------------------



  
  
    // ------------- when page mounted , or activePage , search changed -------------
    useEffect(() => {
      getStatusOrders();
      if(TaskOrder){
        feetchOrders(activePage); // feetch orders
      }else{
        feetchTaskToday(activePage); // feetch task today orders
      }
    }, [activePage, search , Rerender]);
    // ------------- when page mounted , or activePage , search changed -------------
  
  
  
  
    //---------------- data of orders ---------------------
    const rows = elements.map((row) => {
      const Iduser = user.id;
      const isAuthorized = Iduser === row.affected_to?.id; // Check if user can edit
    
      return (
        <Table.Tr 
          key={row.id} 
          style={{
            background: isAuthorized ? 'inherit' : '#f0f0f0', 
            opacity: isAuthorized ? 1 : 0.7
          }}
        >
          {/* Colonne : Société de livraison */}
          <Table.Td>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  background: row.delivery_company.colorHex,
                  border: '0.5px solid black',
                  padding: '2px 12px',
                  borderRadius: '5px',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {row.delivery_company.name}
              </span>
            </div>
          </Table.Td>
    
          {/* Colonne : tracking */}
          <Table.Td>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CopyButton value={row.tracking} timeout={2000}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Copié !' : 'Copier le tracking'} withArrow position="right">
                      <ActionIcon
                        color={copied ? 'teal' : 'gray'}
                        variant="light"
                        onClick={copy}
                        style={{
                          border: copied ? '0.5px solid teal' : '0.5px solid gray',
                          padding: '5px',
                          borderRadius: '8px',
                        }}
                      >
                        {copied ? <IconCheck style={{ width: rem(18), height: rem(18) }} /> : <IconCopy style={{ width: rem(18), height: rem(18) }} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              <span
                style={{
                  background: '#dee2e6',
                  border: '0.5px solid black',
                  padding: '2px 12px',
                  borderRadius: '5px',
                  color: 'black',
                  display: 'flex',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                }}
              >
                {row.tracking}
              </span>
            </div>
          </Table.Td>
    
          {/* Colonne : Statut de la commande */}
          <Table.Td>
            <Group style={{ flexWrap: 'nowrap' }}>
              
              {isAuthorized ? (
                row.archive === 0 ? (
                  <NativeSelect
                    defaultValue={row.status.id.toString()}
                    data={StatusOrderIndex}
                    onChange={(event) => UpdateOrderStatus(row.id, event.currentTarget.value)}
                    styles={() => ({
                      input: {
                        borderRadius: '8px',
                        display: "flex",
                        background: `${row.status.colorHex}1A`,
                        border: `1px solid ${row.status.colorHex}`,
                        color: row.status.colorHex,
                        width: '200px',
                      },
                    })}
                  />
                ) : (
                  <div
                    style={{
                      borderRadius: '8px',
                      display: 'flex',
                      background: `${row.status.colorHex}1A`,
                      border: `1px solid ${row.status.colorHex}`,
                      color: row.status.colorHex,
                      width: '200px',
                      height: '35px',
                      alignItems: 'center',
                      paddingLeft: '12px',
                    }}
                  >
                    {row.status.status}
                  </div>
                )
              ) : (
                <div
                  style={{
                    borderRadius: '8px',
                    display: 'flex',
                    background: `${row.status.colorHex}1A`,
                    border: `1px solid ${row.status.colorHex}`,
                    color: row.status.colorHex,
                    width: '200px',
                    height: '35px',
                    alignItems: 'center',
                    paddingLeft: '12px',
                  }}
                >
                  {row.status.status}
                </div>
              )}
              {isAuthorized && (
                <ActionIcon style={{ background: '#dee2e6', border: '0.1px dashed #222426' }} variant="subtle" color="gray" onClick={() => CallModal(row.id)}>
                  <IconHistory style={{ width: '16px', height: '16px' }} stroke={1.5} />
                </ActionIcon>
              )}
            </Group>
          </Table.Td>
    
          {/* Autres colonnes en lecture seule */}
          <Table.Td style={{ whiteSpace: 'nowrap' }}>{row.external_id}</Table.Td>
          <Table.Td style={{ whiteSpace: 'nowrap' }}>{row.client_name}</Table.Td>
          <Table.Td style={{ whiteSpace: 'nowrap' }}>{row.client_lastname}</Table.Td>
          <Table.Td style={{ whiteSpace: 'nowrap' }}>{row.phone}</Table.Td>
    
          {/* Colonne : Créé par */}
          <Table.Td>
            <span style={{ border: 'black dashed 1px', padding: 5, borderRadius: 8, color: 'black', whiteSpace: 'nowrap' }}>
              {row.created_by.name}
            </span>
          </Table.Td>
    
          {/* Colonne : Actions */}
          <Table.Td>
            <Group gap={5} justify="flex-start" style={{ flexWrap: 'nowrap' }}>
              {row.product_url !== null ? (
                <ActionIcon color="gray" onClick={() => window.open(row.product_url, '_blank')}>
                  <IconUnlink style={{ width: '16px', height: '16px' }} stroke={1.5} />
                </ActionIcon>
              ) : (
                <ActionIcon color="black">
                  <IconLinkOff style={{ width: '16px', height: '16px' }} stroke={1.5} />
                </ActionIcon>
              )}
    
              {isAuthorized ? (
                row.archive === 0 ? (
                  <ActionIcon variant="subtle" color="gray" onClick={() => UpdateOrderModal(row.id)}>
                    <IconPencil style={{ width: '16px', height: '16px' }} stroke={1.5} />
                  </ActionIcon>
                ) : (
                  <Badge variant="filled" color="black" leftSection={<IconArchive style={{ width: '14px', height: '14px' }} />}>
                    Archivé
                  </Badge>
                )
              ) : null}
            </Group>
          </Table.Td>
        </Table.Tr>
      );
    });
    
    //---------------- data of orders ---------------------
  
  
  
  
    // -------------- before load data from api -----------------
    const renderSkeletons = () =>
      Array.from({ length: 5 }).map((_, index) => (
        <Table.Tr key={index}>
          <Table.Td style={{ width: "30%" }}>
            <Group style={{ alignItems: "center" }}>
              <Skeleton height={16} width="70%" />
            </Group>
          </Table.Td>
          <Table.Td style={{ width: "30%" }}>
            <Group spacing="xs" style={{ flexWrap: 'nowrap' }}>
              <Skeleton radius="xs" height={24} width={24} />
              <Skeleton height={16} width="60%" />
            </Group>
          </Table.Td>
          <Table.Td style={{ width: "30%" }}>
            <Group spacing="xs" style={{ flexWrap: 'nowrap' }}>
              <Skeleton radius="xs" height={24} width={24} />
              <Skeleton height={16} width="60%" />
            </Group>
          </Table.Td>
          <Table.Td style={{ width: "30%" }}>
            <Group style={{ alignItems: "center" }}>
              <Skeleton height={16} width="70%" />
            </Group>
          </Table.Td>
          <Table.Td style={{ width: "30%" }}>
            <Group style={{ alignItems: "center" }}>
              <Skeleton height={16} width="70%" />
            </Group>
          </Table.Td>
          <Table.Td style={{ width: "30%" }}>
            <Group style={{ alignItems: "center" }}>
              <Skeleton height={16} width="70%" />
            </Group>
          </Table.Td>
          <Table.Td style={{ width: "30%" }}>
            <Group style={{ alignItems: "center" }}>
              <Skeleton height={16} width="70%" />
            </Group>
          </Table.Td>
          <Table.Td style={{ width: "20%"}} >
            <Group justify="flex-end" spacing="xs" style={{ flexWrap: 'nowrap' }}>
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
          Gestion des commandes
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 1 }} spacing="lg">
          {/* Actions Section */}
          <SimpleGrid cols={{ base: 1, sm: 2 }}>
            {/* Ajouter des commandes */}
            <Paper style={styleCard}>
              <Flex gap="sm" align="center">
                {/* Bouton d'exportation avec indicateur de chargement */}
                <Button 
                  onClick={exportOrders} 
                  fullWidth 
                  variant="outline" 
                  loading={loadingExport}
                >
                  Exporter
                </Button>

                {/* Bouton de bascule entre tâches et commandes avec indicateur de chargement */}
                <Button
                  onClick={changeOrderTask}
                  fullWidth
                  leftSection={loading ? <Loader size="sm" color="gray" /> : TaskOrder ? <IconList stroke={2} /> : <IconPackage stroke={2} />}
                  variant="outline"
                  color={TaskOrder ? "red" : "blue"}
                  disabled={loading} // Désactiver le bouton pendant le chargement
                >
                  {loading ? "Chargement..." : TaskOrder ? "Tâches" : "Commandes"}
                </Button>
              </Flex>
            </Paper>

            {/* Recherche */}
            <Paper style={styleCard}>
              <form style={{ width: '100%' }} onSubmit={formSearch.onSubmit(handleSearch)}>
                <TextInput
                  size="sm"
                  radius="md"
                  placeholder="Rechercher des commandes..."
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
                          <Table.Th>Société de livraison</Table.Th> {/* Société de livraison */}
                          <Table.Th>tracking</Table.Th> {/* tracking */}
                          <Table.Th>Statut</Table.Th> {/* Statut */}
                          <Table.Th>ID externe</Table.Th> {/* ID externe */}
                          <Table.Th>Nom</Table.Th> {/* Nom */}
                          <Table.Th>Prénom</Table.Th> {/* Prénom */}
                          <Table.Th>Téléphone</Table.Th> {/* Téléphone */}
                          <Table.Th>Créateur</Table.Th> {/* Créateur */}
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {renderSkeletons()} {/* Appeler la fonction renderSkeletons */}
                      </Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>
                ) : elements.length > 0 ? (
                <>
                


              <Table.ScrollContainer style={styleCard} minWidth={800}>
                <Table striped highlightOnHover verticalSpacing="xs">
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Société de livraison</Table.Th> {/* Société de livraison */}
                      <Table.Th>tracking</Table.Th> {/* tracking */}
                      <Table.Th>Statut</Table.Th> {/* Statut */}
                      <Table.Th>ID externe</Table.Th> {/* ID externe */}
                      <Table.Th>Nom</Table.Th> {/* Nom */}
                      <Table.Th>Prénom</Table.Th> {/* Prénom */}
                      <Table.Th>Téléphone</Table.Th> {/* Téléphone */}
                      <Table.Th>Créateur</Table.Th> {/* Créateur */}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody height={80}>
                    {rows} {/* Afficher les lignes du tableau */}
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
                            <Table.Th>Société de livraison</Table.Th> {/* Société de livraison */}
                            <Table.Th>tracking</Table.Th> {/* tracking */}
                            <Table.Th>Statut</Table.Th> {/* Statut */}
                            <Table.Th>ID externe</Table.Th> {/* ID externe */}
                            <Table.Th>Nom</Table.Th> {/* Nom */}
                            <Table.Th>Prénom</Table.Th> {/* Prénom */}
                            <Table.Th>Téléphone</Table.Th> {/* Téléphone */}
                            <Table.Th>Créateur</Table.Th> {/* Créateur */}
                          </Table.Tr>
                        </Table.Thead>
                      </Table>
                      <div 
                        style={{ 
                          backgroundColor: '#dfdddd4c', // Fond gris clair avec opacité
                          height: '500px', // Hauteur fixe
                          display: 'flex', 
                          justifyContent: 'center', // Centrer horizontalement
                          alignItems: 'center', // Centrer verticalement
                          borderRadius: '2px' // Bordures arrondies
                        }}
                      >
                        <Text 
                          size="lg" 
                          weight={500} 
                          style={{ color: '#7d7d7d' }} // Couleur du texte gris
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
  