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
    Select,
    NativeSelect,
    Timeline,
    Avatar,
    Textarea,
    Loader,
    Center,
    Alert,
    List,
    ThemeIcon,
    Badge,
  } from '@mantine/core';
  import { IconUpload, IconX , IconSearch, IconArrowRight, IconTrash, IconPencil, IconCheck, IconCopy, IconHistory, IconList, IconPackage, IconFileUpload, IconArchive, IconUnlink, IconLinkOff, IconArchiveOff, IconRosetteDiscountCheck, IconRosetteDiscountCheckOff, IconMail, IconMailOpened, IconAlertSquareRounded, IconPlus} from '@tabler/icons-react';
  import { useForm } from '@mantine/form';
  import { modals } from '@mantine/modals';
  import { notifications } from '@mantine/notifications';
  import { useEffect, useState } from 'react';
  import { agents } from '../../../../services/api/admin/agents';
  import { orders } from '../../../../services/api/admin/orders';
  import { deleveryCompanies } from '../../../../services/api/admin/deleveryCompanies';
  import { useUserContext } from "../../../../context/UserContext";
  import { statusOrders } from '../../../../services/api/admin/statusOrders';
  import { Dropzone , MS_EXCEL_MIME_TYPE } from '@mantine/dropzone';
  import '@mantine/dropzone/styles.css';
  import { historyOrders } from '../../../../services/api/admin/historyOrders';
  
  
  
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
      // Fetch the order data based on the provided `id`
      const order = elements.find((element) => element.id === id);
    
      const [deleveryCompaniesElement, setdeleveryCompaniesElement] = useState([]);
      const [agentsElement, setagentsElement] = useState([]);
    
      // Fetch delivery companies and agents for the dropdowns
      const getDeleveryCompanies = async () => {
        try {
          const response = await deleveryCompanies.index();
          const companies = response.data.map((company) => ({
            value: company.id.toString(),
            label: company.name,
          }));
          setdeleveryCompaniesElement(companies);
        } catch (error) {
          notifications.show({
            message: 'Erreur lors de la récupération des sociétés de livraison : ' + error,
            color: 'red',
          });
        }
      };
    
      const getAgent = async (search = '', page = 1) => {
        try {
          const response = await agents.index(page, search);
          const data = response.data.data.map((agent) => ({
            value: agent.id.toString(),
            label: agent.name,
          }));
          setagentsElement(data);
        } catch (error) {
          notifications.show({
            message: 'Erreur lors de la récupération des agents : ' + error,
            color: 'red',
          });
        }
      };
    
      useEffect(() => {
        getDeleveryCompanies();
        getAgent(order?.affected_to.name, 1);
      }, []);
    
      // Initialize the form with the agent's existing data
      const formCreate = useForm({
        initialValues: {
          deleveryCompany: order?.delivery_company.id?.toString() || '',
          tracking: order?.tracking || '',
          external_id: order?.external_id || '',
          client_name: order?.client_name || '',
          client_lastname: order?.client_lastname || '',
          phone: order?.phone || '',
          affected_to: order?.affected_to.id?.toString() || '',
          product_url: order?.product_url || '',
        },
        validate: {
          deleveryCompany: (value) =>
            value.trim().length === 0 ? 'La société de livraison est requise' : null,
          tracking: (value) =>
            value.trim().length === 0 ? 'Le Tracking est requis' : null,
          external_id: (value) =>
            value.trim().length > 255 ? 'L\'ID externe ne doit pas dépasser 255 caractères' : null,
          client_name: (value) =>
            value.trim().length === 0
              ? 'Le nom du client est requis'
              : value.trim().length < 3
              ? 'Le nom du client doit comporter au moins 3 caractères'
              : null,
          client_lastname: (value) =>
            value.trim().length > 0 && value.trim().length < 3
              ? 'Le Prénom du client doit comporter au moins 3 caractères'
              : null,
          phone: (value) =>
            value.trim().length === 0
              ? 'Le numéro de téléphone est requis'
              : value.trim().length > 50
              ? 'Le numéro de téléphone doit comporter 50 caractères ou moins'
              : !/^[\d\s+-]+$/.test(value)
              ? 'Le numéro de téléphone contient des caractères invalides'
              : null,
          affected_to: (value) =>
            value.trim().length === 0 ? 'L\'affectation est requise' : null,
          product_url: (value) =>
            value.trim().length > 0 && value.trim().length < 5
              ? 'L\'URL du produit doit comporter au moins 3 caractères'
              : null, // Nullable, so no error if empty
        },
      });
    
      const handleSubmit = async (values) => {
        try {
          // Make API call to update the order
          const { data } = await orders.update(id, values);
          console.log(data);
          setRerender(!Rerender);
          // Show success notification
          notifications.show({
            message: 'Commande mise à jour avec succès !',
            color: 'green',
          });
    
          // Reset form and close modal on success
          formCreate.reset();
          closeModal();
        } catch (error) {
          // Log the error for debugging
          console.error('Erreur lors de la mise à jour de la commande :', error);
    
          // Display failure notification
          notifications.show({
            message: error?.response?.data?.message || 'Échec de la mise à jour de la commande. Veuillez réessayer.',
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
          {/* Delivery Company */}
          <Select
            label="Société de livraison"
            withAsterisk
            placeholder="Sélectionnez une société de livraison"
            checkIconPosition="right"
            data={deleveryCompaniesElement}
            searchable
            mt="sm"
            nothingFoundMessage="Aucun résultat trouvé..."
            {...formCreate.getInputProps('deleveryCompany')}
          />
    
          {/* Tracking */}
          <TextInput
            label="Tracking"
            withAsterisk
            mt="sm"
            placeholder="YAL-TAXKXD"
            {...formCreate.getInputProps('tracking')}
          />
    
          {/* External ID */}
          <TextInput
            label="ID externe"
            withAsterisk
            mt="sm"
            placeholder="web5010"
            {...formCreate.getInputProps('external_id')}
          />
    
          {/* Client Name */}
          <TextInput
            label="Nom du client"
            withAsterisk
            mt="sm"
            placeholder="Prénom"
            {...formCreate.getInputProps('client_name')}
          />
    
          {/* Client Lastname */}
          <TextInput
            label="Prénom du client"
            mt="sm"
            placeholder="Prénom"
            {...formCreate.getInputProps('client_lastname')}
          />
    
          {/* Client Phone */}
          <TextInput
            label="Téléphone du client"
            withAsterisk
            mt="sm"
            placeholder="0501010011"
            {...formCreate.getInputProps('phone')}
          />
    
          {/* Affected To */}
          <Select
            label="Affecté à"
            withAsterisk
            placeholder="Sélectionnez un agent"
            checkIconPosition="right"
            data={agentsElement}
            searchable
            mt="sm"
            onSearchChange={(search) => getAgent(search)} // Pass the search value
            nothingFoundMessage="Aucun résultat trouvé..."
            {...formCreate.getInputProps('affected_to')}
          />
    
          {/* Product URL */}
          <TextInput
            label="URL du produit"
            mt="sm"
            placeholder="URL du produit"
            {...formCreate.getInputProps('product_url')}
          />
    
          {/* Submit Button */}
          <Button type="submit" fullWidth mt="md">
            Mettre à jour
          </Button>
    
          {/* Cancel Button */}
          <Button fullWidth mt="md" variant="outline" onClick={closeModal}>
            Annuler
          </Button>
        </form>
      );
    };
    
    const UpdateOrderModal = (id) => {
      modals.open({
        title: 'Mettre à jour la commande',
        centered: true,
        children: <UpdateOrderForm id={id} closeModal={() => modals.closeAll()} />,
      });
    };
    // ------------------ update Agent : id ----------------------
  

    // ------------------ update archive : id ----------------------
    const updateArchive = async (orderId, archiveStatus) => {
      try {
        // Call the API to update the archive status
        const { data } = await orders.updateArchive(orderId, { archive: archiveStatus });
        console.log(data);
    
        // Trigger a re-render or update state
        setRerender(!Rerender);
    
        // Show success notification
        notifications.show({
          message: 'Statut d\'archivage de la commande mis à jour avec succès !',
          color: 'green',
        });
      } catch (error) {
        // Show error notification
        notifications.show({
          message: `Échec de la mise à jour du statut d\'archivage de la commande : ${error.message}`,
          color: 'red',
        });
      }
    };
    // ------------------ update archive : id ----------------------
  
  
  
  
    // ------------------ create New Order ----------------------
    const CreateOrderForm = ({ closeModal }) => {
      const [deleveryCompaniesElement, setdeleveryCompaniesElement] = useState([]);
      const [agentsElement, setagentsElement] = useState([]);
    
      const formCreate = useForm({
        initialValues: {
          deleveryCompany: '',
          tracking: '',
          external_id: '',
          client_name: '',
          client_lastname: '',
          phone: '',
          affected_to: '',
          product_url: '',
        },
        validate: {
          deleveryCompany: (value) =>
            value.trim().length === 0 ? 'La société de livraison est requise' : null,
    
          tracking: (value) =>
            value.trim().length === 0 ? 'Le Tracking est requis' : null,
    
          external_id: (value) =>
            value.trim().length > 255 ? 'L\'ID externe ne doit pas dépasser 255 caractères' : null,
    
          client_name: (value) =>
            value.trim().length === 0
              ? 'Le nom du client est requis'
              : value.trim().length < 3
              ? 'Le nom du client doit comporter au moins 3 caractères'
              : null,
    
          client_lastname: (value) =>
            value.trim().length > 0 && value.trim().length < 3
              ? 'Le Prénom du client doit comporter au moins 3 caractères'
              : null, // Nullable, so no error if empty
    
          phone: (value) =>
            value.trim().length === 0
              ? 'Le numéro de téléphone est requis'
              : value.trim().length > 50
              ? 'Le numéro de téléphone doit comporter 50 caractères ou moins'
              : !/^[\d\s+-]+$/.test(value)
              ? 'Le numéro de téléphone contient des caractères invalides'
              : null,
    
          affected_to: (value) =>
            value.trim().length === 0 ? 'L\'affectation est requise' : null,
    
          product_url: (value) =>
            value.trim().length > 0 && value.trim().length < 5
              ? 'L\'URL du produit doit comporter au moins 3 caractères'
              : null, // Nullable, so no error if empty
        },
      });
    
      const handleSubmit = async (values) => {
        try {
          // Make API call to create the agent
          const { data } = await orders.post(values);
    
          console.log(data);
          setRerender(!Rerender);
          // Show success notification
          notifications.show({
            message: 'Commande créée avec succès !',
            color: 'green',
          });
    
          // Reset form and close modal on success
          formCreate.reset();
          closeModal();
        } catch (error) {
          // Log the error for debugging
          console.error('Erreur lors de la création de la commande :', error);
    
          // Display failure notification
          notifications.show({
            message: error?.response?.data?.message || 'Échec de la création de la commande. Veuillez réessayer.',
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
    
      const getDeleveryCompanies = async () => {
        try {
          const response = await deleveryCompanies.index();
          const companies = response.data.map((company) => ({
            value: company.id.toString(), // Use `id` as the value
            label: company.name, // Use `name` as the label
          }));
          setdeleveryCompaniesElement(companies);
        } catch (error) {
          notifications.show({ message: 'Erreur lors de la récupération des sociétés de livraison : ' + error, color: 'red' });
        }
      };
    
      const getAgent = async (search = '', page = 1) => {
        try {
          const response = await agents.index(page, search); // Pass search value
          const data = response.data.data.map((agent) => ({
            value: agent.id.toString(), // Use `id` as the value
            label: agent.name, // Use `name` as the label
          }));
          setagentsElement(data); // Update the `agentsElement` state
        } catch (error) {
          notifications.show({ message: 'Erreur lors de la récupération des agents : ' + error, color: 'red' });
        }
      };
    
      useEffect(() => {
        getDeleveryCompanies();
        getAgent('', 1);
      }, []);
    
      return (
        <form onSubmit={formCreate.onSubmit(handleSubmit, handleError)}>
          {/* Delivery Company */}
          <Select
            label="Société de livraison"
            withAsterisk
            placeholder="Sélectionnez une société de livraison"
            checkIconPosition="right"
            data={deleveryCompaniesElement}
            searchable
            mt="sm"
            nothingFoundMessage="Aucun résultat trouvé..."
            {...formCreate.getInputProps('deleveryCompany')}
          />
    
          {/* Tracking */}
          <TextInput
            label="Tracking"
            withAsterisk
            mt="sm"
            placeholder="YAL-TAXKXD"
            {...formCreate.getInputProps('tracking')}
          />
    
          {/* External ID */}
          <TextInput
            label="ID externe"
            withAsterisk
            mt="sm"
            placeholder="web5010"
            {...formCreate.getInputProps('external_id')}
          />
    
          {/* Client Name */}
          <TextInput
            label="Nom du client"
            withAsterisk
            mt="sm"
            placeholder="Prénom"
            {...formCreate.getInputProps('client_name')}
          />
    
          {/* Client Lastname */}
          <TextInput
            label="Prénom du client"
            mt="sm"
            placeholder="Prénom"
            {...formCreate.getInputProps('client_lastname')}
          />
    
          {/* Client Phone */}
          <TextInput
            label="Téléphone du client"
            withAsterisk
            mt="sm"
            placeholder="0501010011"
            {...formCreate.getInputProps('phone')}
          />
    
          {/* Affected To */}
          <Select
            label="Affecté à"
            withAsterisk
            placeholder="Sélectionnez un agent"
            checkIconPosition="right"
            data={agentsElement}
            searchable
            mt="sm"
            onSearchChange={(search) => getAgent(search)} // Pass the search value
            nothingFoundMessage="Aucun résultat trouvé..."
            {...formCreate.getInputProps('affected_to')}
          />
    
          {/* Product URL */}
          <TextInput
            label="URL du produit"
            mt="sm"
            placeholder="URL du produit"
            {...formCreate.getInputProps('product_url')}
          />
    
          {/* Submit Button */}
          <Button type="submit" fullWidth mt="md">
            Soumettre
          </Button>
    
          {/* Cancel Button */}
          <Button fullWidth mt="md" variant="outline" onClick={closeModal}>
            Annuler
          </Button>
        </form>
      );
    };
    
    const CreateOrderModal = () => {
      modals.open({
        title: 'Créer une nouvelle commande',
        centered: true,
        children: <CreateOrderForm closeModal={() => modals.closeAll()} />,
      });
    };
    // ------------------ create New Order ----------------------
  
  
  
  
  
  
  
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
        setTotalPages(data.meta.last_page || 1); // Mettre à jour le nombre total de pages
        setLoading(false);
      } catch (error) {
        setLoading(false);
        notifications.show({ message: 'Erreur lors de la récupération des commandes : ' + error, color: 'red' });
      }
    };
    // ------------------- feetch task today  -------------------
    

  
    // ------------------- feetch orders -------------------
    const feetchOrders = async (page = 1) => {
      setLoading(true);
      try {
        const { data } = await orders.index(page, search);
        // console.log(data.data)
        setElements(data.data);
        setTotalPages(data.meta.last_page || 1); // Mettre à jour le nombre total de pages
        setLoading(false);
      } catch (error) {
        setLoading(false);
        notifications.show({ message: 'Erreur lors de la récupération des commandes : ' + error, color: 'red' });
      }
    };
    // ------------------- feetch orders -------------------
  

    // ------------------- export orders -------------------
    const exportOrders = async () => {
      setLoadingExport(true)
      try {
        const response = await orders.exportOrders();
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'commandes.xlsx'); // Changed "orders.xlsx" to "commandes.xlsx"
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setLoadingExport(false);
      } catch (error) {
        console.error('Erreur lors de l\'exportation des commandes :', error);
        setLoadingExport(false);
      }
    };
    // ------------------- export orders -------------------
  


    // ------------------- import orders -------------------
    const ImportOrdersForm = ({ closeModal }) => {
      const [file, setFile] = useState(null);
      const [loading, setLoading] = useState(false);
      const [error, setError] = useState(null);
      const [success, setSuccess] = useState(null);
      const [errors, setErrors] = useState([]);
    
      // API request function
      const importOrders = async () => {
        if (!file) {
          setError('Veuillez sélectionner un fichier à importer.');
          return;
        }
    
        const formData = new FormData();
        formData.append('file', file);
    
        try {
          setLoading(true);
          setError(null);
          setSuccess(null);
    
          const response = await orders.importOrders(file);
          console.log(response.data);
    
          if (response.data.errors) {
            // If there are errors, display them
            setError(response.data.message);
            setErrors(response.data.errors); // Store the errors for detailed display
          } else {
            // If no errors, show success message
            setSuccess(response.data.message || 'Fichier importé avec succès.');
          }
        } catch (err) {
          setError(err.response?.data?.error || 'Échec de l\'importation des commandes. Veuillez réessayer.');
        } finally {
          setLoading(false);
          setRerender(!Rerender);
          setFile(null);
        }
      };
    
      const handleDrop = (files) => {
        if (files.length > 0) {
          setFile(files[0]);
          setError(null);
        }
      };
    
      const handleReject = () => {
        setFile(null);
        setError('Type de fichier invalide. Veuillez télécharger un fichier Excel valide (.xlsx).');
      };
    
      const exportOrdersTemplate = async () => {
        try {
          const response = await orders.exportOrdersTemplate();
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'modele_commande.xlsx'); // Changed "order_template.xlsx" to "modele_commande.xlsx"
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error('Erreur lors de l\'exportation du modèle de commande :', error);
        }
      };
    
      return (
        <>
          <Dropzone
            onDrop={handleDrop}
            onReject={handleReject}
            accept={MS_EXCEL_MIME_TYPE}
            maxSize={5 * 1024 * 1024} // 5MB file size limit
          >
            <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
              <Dropzone.Accept>
                <IconUpload style={{ width: 52, height: 52, color: 'var(--mantine-color-blue-6)' }} stroke={1.5} />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <IconX style={{ width: 52, height: 52, color: 'var(--mantine-color-red-6)' }} stroke={1.5} />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <IconFileUpload style={{ width: 52, height: 52, color: 'var(--mantine-color-dimmed)' }} stroke={1.5} />
              </Dropzone.Idle>
    
              <div>
                <Text size="sm" inline>
                  Glissez un fichier Excel (.xlsx) ici ou cliquez pour sélectionner un fichier
                </Text>
                <Text size="xs" color="dimmed">
                  La taille du fichier ne doit pas dépasser 5 Mo
                </Text>
              </div>
            </Group>
          </Dropzone>
    
          {/* Error and Success Alerts */}
          {file !== null && <Alert color="green" mt="md">Le fichier {file.name} a été téléchargé avec succès.</Alert>}
          {error && <Alert color="red" mt="md">{error}</Alert>}
          {success && <Alert color="green" mt="md">{success}</Alert>}
    
          {errors.length > 0 && (
            <Alert color="red" mt="md">
              <List size="sm" spacing="xs">
                {errors.map((error, index) => (
                  <List.Item key={index}>
                    <Text size="sm">Ligne {error.row} :</Text>
                    {Object.entries(error.errors).map(([field, messages]) => (
                      <Text size="sm" key={field}>
                        {field} : {messages.join(', ')}
                      </Text>
                    ))}
                  </List.Item>
                ))}
              </List>
            </Alert>
          )}
    
          {/* Submit and Cancel Buttons */}
          <Button fullWidth mt="md" onClick={importOrders} disabled={loading}>
            {loading ? <Loader size="sm" /> : 'Soumettre'}
          </Button>
          <Button onClick={exportOrdersTemplate} fullWidth mt="md" variant="outline" color="red">
            Télécharger le modèle
          </Button>
          <Button fullWidth mt="md" variant="outline" onClick={closeModal}>
            Annuler
          </Button>
        </>
      );
    };
    
    const ImportOrdersModal = () => {
      modals.open({
        title: 'Importer des commandes',
        centered: true,
        children: <ImportOrdersForm closeModal={() => modals.closeAll()} />,
      });
    };
    // ------------------- import orders -------------------


  
    // --------------------- delete actions --------------------- 
    const DeleteOrderModal = (id) => modals.openConfirmModal({
      title: 'Confirmer la suppression',
      centered: true,
      children: (
        <Text size="sm">
          Êtes-vous sûr de vouloir supprimer cette commande ? <br />
          REMARQUE : Cette action est irréversible.
        </Text>
      ),
      labels: { confirm: 'Confirmer', cancel: 'Annuler' },
      onCancel: () => console.log('Annuler'),
      onConfirm: () => {
        handleDelete(id);
      },
    });
    
    const handleDelete = async (id) => {
      try {
        const response = await orders.delete(id);
    
        // Adjust pagination or fetch agents based on current conditions
        if (elements.length === 1 && activePage > 1) {
          setRerender(!Rerender);
          setActivePage(activePage - 1);
        } else if (elements.length === 1 && activePage === 1) {
          feetchOrders(1); // Refresh the first page
          setActivePage(1);
        } else {
          setElements(elements.filter(el => el.id !== id)); // Remove the deleted element from the list
        }
    
        // Show success notification
        notifications.show({ message: response.data.message, color: 'green' });
      } catch (error) {
        // Show error notification
        notifications.show({ message: error.response?.data?.message || 'Une erreur s\'est produite', color: 'red' });
      }
    };
    // --------------------- delete actions --------------------- 
    
  
  

  
  // ------------------ get status order ----------------------
    const getStatusOrders = async () => {
      setLoading(true);
      try {
        const response = await statusOrders.index();
        const statusOrdersdata = response.data.map((status) => ({
          value: status.id.toString(),  // Use `id` as the value
          label: status.status,         // Use `name` as the label
          colorHex: status.colorHex,
        }));
        setStatusOrdersdata(statusOrdersdata);

        const filteredStatusOrders = statusOrdersdata.map((item) => ({
          value: item.value, // Keep the original value
          label: item.label, // Keep the original label
          disabled: item.label === "Tentative échouée" || item.label === "En attente du client" || item.label === "Échec livraison", // Disable specific items
        }));
        setStatusOrderIndex(filteredStatusOrders);

      } catch (error) {
        notifications.show({ message: 'Erreur lors de la récupération des données du statut des commandes : ' + error, color: 'red' });
      }
    };
  // ------------------ get status order  ----------------------







  // ------------------ update status order  -------------------
  const UpdateOrderStatus = async (orderId, statusId) => {
    try {
      // Step 1: Update the order status
      const updateStatusRequest = orders.updateStausOrder(orderId, { statusId });
  
      // Step 2: Create a new HistoryOrder with status_order_id, history_judge = false, and order_id
      const historyData = {
        status_order_id: statusId,
        order_id: orderId,
        history_judge: false,
        note: "Statut de la commande mis à jour", // Optional: You can add additional notes here
        timetook: "00:00:00", // Optional: If you want to set a time, adjust accordingly
      };
  
      const createHistoryRequest = historyOrders.post(historyData);
  
      // Wait for both requests to be successful
      const [statusData, historyDataResponse] = await Promise.all([updateStatusRequest, createHistoryRequest]);
  
      // If both requests are successful, trigger re-render
      console.log(statusData);
      console.log(historyDataResponse);
  
      // Step 3: Trigger re-render (assuming you want to refresh some UI state)
      setRerender(!Rerender);
  
      // Show success notification
      notifications.show({
        message: 'Statut de la commande mis à jour et historique créé avec succès !',
        color: 'green',
      });
    } catch (error) {
      // Handle error and show notification
      notifications.show({
        message: `Échec de la mise à jour du statut de la commande ou de la création de l'historique : ${error.message}`,
        color: 'red',
      });
    }
  };
  // ------------------ update status order  -------------------
  
  



  // ------------------ Call Model ----------------------
  const CallModelComponent = ({ closeModal, id }) => {
    const [history, setHistory] = useState([]);
    const [reasonCalls, setReasonCalls] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [LoadingValidate, setLoadingValidate] = useState(false);
    const [statusOrder, setStatusOrder] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('');
  
    const formCreate = useForm({
      initialValues: {
        status_order_id: '',
        reason_id: '',
        note: '',
        history_judge: true,
        order_id: id,
        timetook: "00:00:00",
      },
      validate: {
        status_order_id: (value) =>
          value.trim().length === 0 ? 'Le statut est requis' : null,
        note: (value) =>
          value.trim().length < 2
            ? 'La note doit comporter au moins 2 caractères'
            : null,
      },
    });
  
    // Fetch history orders
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const { data } = await orders.order_history(id);
        setHistory(data.data); // Use the correct response structure
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'historique des commandes :', error.message);
      } finally {
        setLoadingHistory(false);
      }
    };
  
    // Fetch calls Reasons
    const fetchReasonscalls = async () => {
      setLoadingHistory(true);
      try {
        const response = await orders.ReasonsCall();
        const formattedData = response.data.map((item) => ({
          value: item.id.toString(), // Use the correct field for value
          label: item.reason, // Use the correct field for label
        }));
        setReasonCalls(formattedData); // Update state with formatted data
      } catch (error) {
        console.error('Erreur lors de la récupération des raisons d\'appel :', error.message);
      } finally {
        setLoadingHistory(false);
      }
    };
  
    // Handle validate
    const handle_validate = async (id) => {
      setLoadingHistory(true);
      setLoadingValidate(!LoadingValidate);
      try {
        await historyOrders.update_history_validator(id);
      } catch (error) {
        console.error('Erreur lors de la validation de l\'historique :', error.message);
      } finally {
        setLoadingHistory(false);
        setLoadingValidate(!LoadingValidate);
        setRerender(!Rerender);
      }
    };
  
    // Handle status orders data (filtered)
    const handleStatusOrdersData = () => {
      const filteredStatusOrders = StatusOrdersdata.filter(
        (item) =>
          item.label === "Tentative échouée" ||
          item.label === "En attente du client" ||
          item.label === "Échec livraison"
      );
  
      setStatusOrder((prevState) => [...prevState, ...filteredStatusOrders]);
    };
  
    // Handle submit call form
    const handleSubmit = async (values) => {
      try {
        // Make API call add history order
        await historyOrders.post(values);
  
        // Make API call update order status
        await orders.updateStausOrder(id, { statusId: values.status_order_id });
  
        // Show success notification
        notifications.show({
          message: 'Historique de commande créé avec succès !',
          color: 'green',
        });
  
        setRerender(!Rerender);
  
        // Reset form and close modal on success
        formCreate.reset();
        closeModal();
      } catch (error) {
        // Log the error for debugging
        console.error('Erreur lors de la création de la commande :', error);
  
        // Display failure notification
        notifications.show({
          message: error?.response?.data?.message || 'Échec de la création de la commande. Veuillez réessayer.',
          color: 'red',
        });
      }
    };
  
    useEffect(() => {
      console.log(selectedStatus);
      formCreate.setFieldValue('reason', '');
    }, [selectedStatus]);
  
    useEffect(() => {
      handleStatusOrdersData();
      fetchReasonscalls();
      fetchHistory();
    }, [LoadingValidate]);
  
    return (
      <div>
        {loadingHistory ? (
          <Center style={{ height: '10vh' }}>
            <Loader color="blue" type="bars" />
          </Center>
        ) : (
          <>
            <form onSubmit={formCreate.onSubmit(handleSubmit)}>
              <NativeSelect
                label="Statut de la commande"
                placeholder="Sélectionnez un statut"
                withAsterisk
                data={[{ value: '', label: 'Sélectionnez un statut', disabled: true }, ...statusOrder]} // Add an empty option
                value={formCreate.values.status_order_id || ''} // Ensure value defaults to an empty string
                onChange={(event) => {
                  const selectedValue = event.currentTarget.value; // Get the selected value
                  const selectedLabel = statusOrder.find((item) => item.value === selectedValue)?.label || ''; // Find the corresponding label
  
                  setSelectedStatus(selectedLabel); // Update custom label state
                  formCreate.setFieldValue('status_order_id', selectedValue); // Update form field value
                }}
              />
  
              {/* Reason */}
              {['Échec livraison', 'Tentative échouée'].includes(selectedStatus) && (
                <NativeSelect
                  label="Raison"
                  placeholder="Sélectionnez une raison"
                  withAsterisk
                  data={reasonCalls} // The data source for the dropdown
                  value={formCreate.values.reason_id || ''} // Explicitly bind the form field
                  onChange={(event) => formCreate.setFieldValue('reason_id', event.currentTarget.value)} // Update form value
                  mt="sm"
                />
              )}
  
              {/* Agent Note */}
              <Textarea
                label="Note"
                placeholder="Ajoutez votre note ici..."
                withAsterisk
                mt="sm"
                {...formCreate.getInputProps('note')}
              />
  
              {/* Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', whiteSpace: 'nowrap', marginTop: '1rem' }}>
                <Button fullWidth variant="outline" onClick={closeModal}>
                  Annuler
                </Button>
                <Button fullWidth type="submit">
                  Soumettre
                </Button>
              </div>
            </form>
  
            {/* History Timeline */}
            <div>
              <Paper withBorder radius="md" shadow="sm" p="xl" mt={20}>
                {history.length === 0 ? (
                  // Display this message if history is empty
                  <Text color="dimmed" size="sm" align="center">
                    Aucun historique pour le moment.
                  </Text>
                ) : (
                  // Render the Timeline if there are history items
                  <Timeline radius={'sm'} lineWidth={0.5} bulletSize={35} active={history.length} style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                    {history.map((item) => (
                      <Timeline.Item
                        key={item.id}
                        title={
                          <Group spacing="sm">
                            <Text weight={700} size="lg">
                              {item.status?.status
                                ? `${item.status.status}${item.reason?.reason ? ` (${item.reason.reason})` : ''}`
                                : 'Aucun statut fourni'}
                            </Text>
                            <Text size="xs" color="dimmed">
                              {item.created_at}
                            </Text>
                          </Group>
                        }
                        bullet={
                          item.validator !== null || (item.validator === null && item.history_judge == false) ? (
                            <ThemeIcon>
                              <IconRosetteDiscountCheck size="18rem" />
                            </ThemeIcon>
                          ) : null
                        }
                      >
                        <Group align="center" spacing="sm" mt="xs">
                          {item.agent?.role === 'admin' ? (
                            <Avatar size={30} radius="sm" color="green">
                              {item.agent?.name
                                ? item.agent.name.charAt(0).toUpperCase() + item.agent.name.charAt(item.agent.name.length - 1).toUpperCase()
                                : ''}
                            </Avatar>
                          ) : (
                            <Avatar size={30} radius="sm" color="blue">
                              {item.agent?.name
                                ? item.agent.name.charAt(0).toUpperCase() + item.agent.name.charAt(item.agent.name.length - 1).toUpperCase()
                                : ''}
                            </Avatar>
                          )}
                          <Text weight={500} size="md">
                            {item.agent?.name || 'Agent inconnu'}
                          </Text>
                          {item.validator == null && item.history_judge == true ? (
                            <Button size="xs" color="pink" variant="light" onClick={() => handle_validate(item.id)}>
                              VALIDER
                            </Button>
                          ) : item.history_judge == true ? (
                            <Badge variant="light" color="green" radius="sm">
                              validé par : {item.validator?.name}
                            </Badge>
                          ) : null}
                        </Group>
  
                        {item.history_judge == true ? (
                          <>
                            <Text color="dimmed" size="sm" mt="xs">
                              {item.note || 'Aucune note supplémentaire disponible'}
                            </Text>
                          </>
                        ) : null}
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
  
  const CallModal = (id) => {
    modals.open({
      title: 'Historique de la commande',
      centered: true,
      children: <CallModelComponent closeModal={() => modals.closeAll()} id={id} />,
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
      return (
        <Table.Tr key={row.id}>
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
    
          <Table.Td>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Copy button */}
              <CopyButton value={row.tracking} timeout={2000}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Copié !' : 'Copier le Tracking'} withArrow position="right">
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
                      {copied ? (
                        <IconCheck style={{ width: rem(18), height: rem(18) }} />
                      ) : (
                        <IconCopy style={{ width: rem(18), height: rem(18) }} />
                      )}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
    
              {/* Badge for delivery company */}
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
    
          <Table.Td>
            <Group style={{ flexWrap: 'nowrap' }}>
              <ActionIcon style={{ background: '#dee2e6', border: '0.1px dashed #222426' }} variant="subtle" color="gray" onClick={() => { CallModal(row.id) }}>
                <IconHistory style={{ width: '16px', height: '16px' }} stroke={1.5} />
              </ActionIcon>
    
              {row.archive === 0 ? (
                <NativeSelect
                  placeholder=""
                  defaultValue={row.status.id.toString()}
                  data={StatusOrderIndex}
                  onChange={(event) => {
                    const selectedValue = event.currentTarget.value; // Get the selected value
                    UpdateOrderStatus(row.id, selectedValue); // Call your function with the necessary parameters
                  }}
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
                    background: `${row.status.colorHex}1A`, // Background with 10% opacity
                    border: `1px solid ${row.status.colorHex}`, // Border color
                    color: row.status.colorHex, // Text color
                    width: '200px',
                    height: '35px',
                    alignItems: 'center', // Vertically center text
                    paddingLeft: '12px', // Add some padding for text
                  }}
                >
                  {row.status.status}
                </div>
              )}
            </Group>
          </Table.Td>
    
          <Table.Td style={{ whiteSpace: 'nowrap' }}>
            {row.external_id}
          </Table.Td>
    
          <Table.Td style={{ whiteSpace: 'nowrap' }}>
            {row.client_name}
          </Table.Td>
    
          <Table.Td style={{ whiteSpace: 'nowrap' }}>
            {row.client_lastname}
          </Table.Td>
    
          <Table.Td style={{ whiteSpace: 'nowrap' }}>
            {row.phone}
          </Table.Td>
    
          <Table.Td>
            <span style={{ border: 'black dashed 1px', padding: 5, borderRadius: 8, color: 'black', whiteSpace: 'nowrap' }}>
              {user.id === row.created_by.id ? 'Moi' : row.created_by.name}
            </span>
          </Table.Td>
    
          <Table.Td>
            <span style={{ border: 'black dashed 1px', padding: 5, borderRadius: 8, color: 'black', whiteSpace: 'nowrap' }}>
              {row.affected_to.name}
            </span>
          </Table.Td>
    
          <Table.Td>
            <Group gap={5} justify="flex-start" style={{ flexWrap: 'nowrap' }}>
              {row.product_url !== null ? (
                <ActionIcon color="gray" onClick={() => { window.open(row.product_url, '_blank'); }}>
                  <IconUnlink style={{ width: '16px', height: '16px' }} stroke={1.5} />
                </ActionIcon>
              ) : (
                <ActionIcon color="black">
                  <IconLinkOff style={{ width: '16px', height: '16px' }} stroke={1.5} />
                </ActionIcon>
              )}
    
              {row.archive === 0 ? (
                <ActionIcon variant="subtle" color="gray" onClick={() => { UpdateOrderModal(row.id) }}>
                  <IconPencil style={{ width: '16px', height: '16px' }} stroke={1.5} />
                </ActionIcon>
              ) : null}
    
              {row.status.status === "En préparation" ? (
                <ActionIcon variant="subtle" color="red" onClick={() => { DeleteOrderModal(row.id) }}>
                  <IconTrash style={{ width: '16px', height: '16px' }} stroke={1.5} />
                </ActionIcon>
              ) : null}
    
              {/* Archive button */}
              {row.status && (row.status.status === "Livré" || row.status.status === "Retourné au vendeur") ? (
                row.archive === 0 ? (
                  <ActionIcon variant="subtle" color="gray" onClick={() => updateArchive(row.id, true)}>
                    <IconArchive style={{ width: '16px', height: '16px' }} stroke={1.5} />
                  </ActionIcon>
                ) : row.archive === 1 ? (
                  <ActionIcon variant="subtle" color="black" onClick={() => updateArchive(row.id, false)}>
                    <IconArchiveOff style={{ width: '16px', height: '16px' }} stroke={1.5} />
                  </ActionIcon>
                ) : null
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
            <Skeleton height={16} width="30%" />
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
          <Table.Td style={{ width: "30%" }}>
            <Group style={{ alignItems: "center" }}>
              <Skeleton height={16} width="70%" />
            </Group>
          </Table.Td>
          <Table.Td style={{ width: "20%"}} >
            <Group justify="flex-end" spacing="xs" style={{ flexWrap: 'nowrap' }}>
              <Skeleton circle height={24} width={24} />
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
          <SimpleGrid cols={{ base: 1, sm: 3 }}>
            


              {/* add orders */}
              <Paper style={styleCard}>
                <Flex gap="sm" align="center">
                  <Button onClick={CreateOrderModal} fullWidth variant="filled" color="blue">
                    <IconPlus stroke={2} />
                  </Button>
                  <Button onClick={ImportOrdersModal} fullWidth variant="outline" color="red">
                    Importer
                  </Button>
                  <Button onClick={exportOrders} fullWidth variant="outline" loading={loadingExport}>
                    Exporter
                  </Button>
                </Flex>
              </Paper>


              <Paper style={styleCard}>
                <Flex gap="sm" align="center">
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




            {/* search */}
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
                          <Table.Th>Société de livraison</Table.Th>
                          <Table.Th>Tracking</Table.Th>
                          <Table.Th>Statut</Table.Th>
                          <Table.Th>ID externe</Table.Th>
                          <Table.Th>Nom</Table.Th>
                          <Table.Th>Prénom</Table.Th>
                          <Table.Th>Téléphone</Table.Th>
                          <Table.Th>Créateur</Table.Th>
                          <Table.Th>Agent</Table.Th>
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
                        <Table.Th>Société de livraison</Table.Th>
                        <Table.Th>Tracking</Table.Th>
                        <Table.Th>Statut</Table.Th>
                        <Table.Th>ID externe</Table.Th>
                        <Table.Th>Nom</Table.Th>
                        <Table.Th>Prénom</Table.Th>
                        <Table.Th>Téléphone</Table.Th>
                        <Table.Th>Créateur</Table.Th>
                        <Table.Th>Agent</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody height={80}>
                      {rows}
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
                            <Table.Th>Société de livraison</Table.Th>
                            <Table.Th>Tracking</Table.Th>
                            <Table.Th>Statut</Table.Th>
                            <Table.Th>ID externe</Table.Th>
                            <Table.Th>Nom</Table.Th>
                            <Table.Th>Prénom</Table.Th>
                            <Table.Th>Téléphone</Table.Th>
                            <Table.Th>Créateur</Table.Th>
                            <Table.Th>Agent</Table.Th>
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
                          borderRadius: '2px',
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
  