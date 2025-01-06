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
  } from '@mantine/core';
  import { IconUpload, IconX , IconSearch, IconArrowRight, IconTrash, IconPencil, IconCheck, IconCopy, IconHistory, IconList, IconPackage, IconFileUpload, IconArchive, IconUnlink, IconLinkOff, IconArchiveOff} from '@tabler/icons-react';
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
  
  
  
  export default function Index() {

    const { user } = useUserContext() ;


    const [activePage, setActivePage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [elements, setElements] = useState([]);
    const [StatusOrdersdata, setStatusOrdersdata] = useState([]);
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
      marginTop:10,
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
            message: 'Error fetching delivery companies: ' + error,
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
            message: 'Error fetching agents: ' + error,
            color: 'red',
          });
        }
      };
    
      useEffect(() => {
        getDeleveryCompanies();
        getAgent(order?.affected_to.name , 1);
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
            value.trim().length === 0 ? 'Delivery company is required' : null,
          tracking: (value) =>
            value.trim().length === 0 ? 'Tracking is required' : null,
          external_id: (value) =>
            value.trim().length > 255 ? 'External ID must not exceed 255 characters' : null,
          client_name: (value) =>
            value.trim().length === 0
              ? 'Client name is required'
              : value.trim().length < 3
              ? 'Client name must have at least 3 characters'
              : null,
          client_lastname: (value) =>
            value.trim().length > 0 && value.trim().length < 3
              ? 'Client last name must have at least 3 characters'
              : null,
          phone: (value) =>
            value.trim().length === 0
              ? 'Phone number is required'
              : value.trim().length > 50
              ? 'Phone number must be 50 characters or less'
              : !/^[\d\s+-]+$/.test(value)
              ? 'Phone number contains invalid characters'
              : null,
          affected_to: (value) =>
            value.trim().length === 0 ? 'Affected to is required' : null,

          product_url: (value) =>
            value.trim().length > 0 && value.trim().length < 5 
              ? 'Product url must have at least 3 characters' 
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
        notifications.show({
          message: 'Please fix the validation errors before submitting.',
          color: 'red',
        });
      };
    
      return (
        <form onSubmit={formCreate.onSubmit(handleSubmit, handleError)}>
          {/* Delivery Company */}
          <Select
            label="Delivery Company"
            withAsterisk
            placeholder="Select a Delivery Company"
            checkIconPosition="right"
            data={deleveryCompaniesElement}
            searchable
            mt="sm"
            nothingFoundMessage="Nothing found..."
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
            label="External ID"
            withAsterisk
            mt="sm"
            placeholder="web5010"
            {...formCreate.getInputProps('external_id')}
          />
    
          {/* Client Name */}
          <TextInput
            label="Client Name"
            withAsterisk
            mt="sm"
            placeholder="First Name"
            {...formCreate.getInputProps('client_name')}
          />
    
          {/* Client Lastname */}
          <TextInput
            label="Client Lastname"
            mt="sm"
            placeholder="Last Name"
            {...formCreate.getInputProps('client_lastname')}
          />
    
          {/* Client Phone */}
          <TextInput
            label="Client Phone"
            withAsterisk
            mt="sm"
            placeholder="0501010011"
            {...formCreate.getInputProps('phone')}
          />
    
          {/* Affected To */}
          <Select
            label="Affected To"
            withAsterisk
            placeholder="Select an Agent"
            checkIconPosition="right"
            data={agentsElement}
            searchable
            mt="sm"
            onSearchChange={(search) => getAgent(search)} // Pass the search value
            nothingFoundMessage="Nothing found..."
            {...formCreate.getInputProps('affected_to')}
          />

          {/* Product URL */}
          <TextInput
            label="Product URL"
            mt="sm"
            placeholder="Product URL"
            {...formCreate.getInputProps('product_url')}
          />
    
          {/* Submit Button */}
          <Button type="submit" fullWidth mt="md">
            Update
          </Button>
    
          {/* Cancel Button */}
          <Button fullWidth mt="md" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
        </form>
      );
    };
    
    const UpdateOrderModal = (id) => {
      modals.open({
        title: 'Update Order',
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
          message: 'Order archive status updated successfully!',
          color: 'green',
        });
      } catch (error) {
        // Show error notification
        notifications.show({
          message: `Failed to update order archive status: ${error.message}`,
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
            value.trim().length === 0 ? 'Delivery company is required' : null,

          tracking: (value) => 
            value.trim().length === 0 ? 'Tracking is required' : null,
            
          external_id: (value) =>
            value.trim().length > 255 ? 'External ID must not exceed 255 characters' : null,
            
          client_name: (value) =>
            value.trim().length === 0 ? 'Client name is required' : 
            value.trim().length < 3 ? 'Client name must have at least 3 characters' : null,
      
          client_lastname: (value) =>
            value.trim().length > 0 && value.trim().length < 3 
              ? 'Client last name must have at least 3 characters' 
              : null, // Nullable, so no error if empty
            
          phone: (value) => 
            value.trim().length === 0 
              ? 'Phone number is required' 
              : value.trim().length > 50 
              ? 'Phone number must be 50 characters or less' 
              : !/^[\d\s+-]+$/.test(value) 
              ? 'Phone number contains invalid characters' 
              : null,

          affected_to: (value) =>
            value.trim().length === 0 ? 'Affected to is required' : null,

          product_url: (value) =>
            value.trim().length > 0 && value.trim().length < 5 
              ? 'Product url must have at least 3 characters' 
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
            message: 'Order created successfully!',
            color: 'green',
          });
      
          // Reset form and close modal on success
          formCreate.reset();
          closeModal();
        } catch (error) {
          // Log the error for debugging
          console.error('Error creating order:', error);
      
          // Display failure notification
          notifications.show({
            message: error?.response?.data?.message || 'Failed to create order. Please try again.',
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



      const getDeleveryCompanies = async () => {
        try {
          const response = await deleveryCompanies.index();
          const companies = response.data.map((company) => ({
            value: company.id.toString(), // Use `id` as the value
            label: company.name,         // Use `name` as the label
          }));
          setdeleveryCompaniesElement(companies);
        } catch (error) {
          notifications.show({ message: 'Error Delevery Companies data:' + error , color: 'red' });
        }
      };

      const getAgent = async (search = '' , page = 1) => {
        try {
          const response = await agents.index(page, search); // Pass search value
          const data = response.data.data.map((agent) => ({
            value: agent.id.toString(), // Use `id` as the value
            label: agent.name,         // Use `name` as the label
          }));
          setagentsElement(data); // Update the `agentsElement` state
        } catch (error) {
          notifications.show({ message: 'Error fetching agents: ' + error, color: 'red' });
        }
      };


      useEffect(() => {
        getDeleveryCompanies();
        getAgent('',1)
      }, []);



    
      return (
          <form onSubmit={formCreate.onSubmit(handleSubmit, handleError)}>
            {/* Delivery Company */}
            <Select
              label="Delivery Company"
              withAsterisk
              placeholder="Select a Delivery Company"
              checkIconPosition="right"
              data={deleveryCompaniesElement}
              searchable
              mt="sm"
              nothingFoundMessage="Nothing found..."
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
              label="External ID"
              withAsterisk
              mt="sm"
              placeholder="web5010"
              {...formCreate.getInputProps('external_id')}
            />

            {/* Client Name */}
            <TextInput
              label="Client Name"
              withAsterisk
              mt="sm"
              placeholder="First Name"
              {...formCreate.getInputProps('client_name')}
            />

            {/* Client Lastname */}
            <TextInput
              label="Client Lastname"
              mt="sm"
              placeholder="Last Name"
              {...formCreate.getInputProps('client_lastname')}
            />

            {/* Client Phone */}
            <TextInput
              label="Client Phone"
              withAsterisk
              mt="sm"
              placeholder="0501010011"
              {...formCreate.getInputProps('phone')}
            />

            {/* Affected To */}
            <Select
              label="Affected To"
              withAsterisk
              placeholder="Select an Agent"
              checkIconPosition="right"
              data={agentsElement}
              searchable
              mt="sm"
              onSearchChange={(search) => getAgent(search)} // Pass the search value
              nothingFoundMessage="Nothing found..."
              {...formCreate.getInputProps('affected_to')}
            />
            
            {/* Product URL */}
            <TextInput
              label="Product URL"
              mt="sm"
              placeholder="Product URL"
              {...formCreate.getInputProps('product_url')}
            />


            {/* Submit Button */}
            <Button type="submit" fullWidth mt="md">
              Submit
            </Button>

            {/* Cancel Button */}
            <Button fullWidth mt="md" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
          </form>
      );
    };
    
    const CreateOrderModal = () => {
      modals.open({
        title: 'Create New Order',
        centered: true,
        children: (
          <CreateOrderForm closeModal={() => modals.closeAll()} />
        ),
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
        setTotalPages(data.meta.last_page || 1); // Update total pages
        setLoading(false);
      } catch (error) {
        setLoading(false);
        notifications.show({ message: 'Error fetching orders :' + error , color: 'red' });
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
          notifications.show({ message: 'Error fetching orders :' + error , color: 'red' });
        }
      };
    // ------------------- feetch agents -------------------
  

    // ------------------- export orders -------------------
    const exportOrders = async () => {
      try {
          const response = await orders.exportOrders();
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', 'orders.xlsx');
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      } catch (error) {
          console.error('Error exporting orders:', error);
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
              setError('Please select a file to upload.');
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
                  setSuccess(response.data.message || 'File imported successfully.');
                  setRerender(!Rerender);
              }
          } catch (err) {
              setError(err.response?.data?.error || 'Failed to import orders. Please try again.');
          } finally {
              setLoading(false);
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
          setError('Invalid file type. Please upload a valid Excel file (.xlsx).');
      };


      const exportOrdersTemplate = async () => {
        try {
            const response = await orders.exportOrdersTemplate();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'order_template.xlsx');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Error exporting order template:', error);
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
                              Drag Excel (.xlsx) file here or click to select files
                          </Text>
                          <Text size="xs" color="dimmed">
                              File size should not exceed 5MB
                          </Text>
                      </div>
                  </Group>
              </Dropzone>
  
              {/* Error and Success Alerts */}
              {file !== null && (<Alert color="green" mt="md">File {file.name} has been successfully uploaded.</Alert>)}
              {error && <Alert color="red" mt="md">{error}</Alert>}
              {success && <Alert color="green" mt="md">{success}</Alert>}

              {errors.length > 0 && (
                <Alert color="red" mt="md">
                    <List size="sm" spacing="xs"> {/* Make the list smaller and reduce spacing */}
                        {errors.map((error, index) => (
                            <List.Item key={index}>
                                <Text size="sm">Row {error.row}:</Text> {/* Smaller text size */}
                                {Object.entries(error.errors).map(([field, messages]) => (
                                    <Text size="sm" key={field}> {/* Smaller text size */}
                                        {field}: {messages.join(', ')}
                                    </Text>
                                ))}
                            </List.Item>
                        ))}
                    </List>
                </Alert>
            )}
  
              {/* Submit and Cancel Buttons */}
              <Button fullWidth mt="md" onClick={importOrders} disabled={loading}>
                  {loading ? <Loader size="sm" /> : 'Submit'}
              </Button>
              <Button onClick={exportOrdersTemplate} fullWidth mt="md" variant="outline" color='red'>
                  Download template
              </Button>
              <Button fullWidth mt="md" variant="outline" onClick={closeModal}>
                  Cancel
              </Button>
          </>
      );
    };
  
    const ImportOrdersModal = () => {
        modals.open({
            title: 'Import Orders',
            centered: true,
            children: <ImportOrdersForm closeModal={() => modals.closeAll()} />,
        });
    };
    // ------------------- import orders -------------------


  
    // --------------------- delete actions --------------------- 
    const DeleteOrderModal = (id) => modals.openConfirmModal({
      title: 'Confirm Deletion',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete this order ? <br />
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
        notifications.show({ message: error.response?.data?.message || 'An error occurred', color: 'red' });
      }
    };
    // --------------------- delete actions --------------------- 
    
  
  

  
  // ------------------ get status order ----------------------
    const getStatusOrders = async () => {
      setLoading(true);
      try {
        const response = await statusOrders.index();
        const statusOrdersdata = response.data.map((status) => ({
          value: status.id.toString(), // Use `id` as the value
          label: status.status,         // Use `name` as the label
          colorHex: status.colorHex,
        }));
        setStatusOrdersdata(statusOrdersdata);
      } catch (error) {
        notifications.show({ message: 'Error get status orders data:' + error , color: 'red' });
      }
    };
  // ------------------ get status order  ----------------------







  // ------------------ update status order  -------------------
  const UpdateOrderStatus = async (orderId, statusId) => {
    try {
      const { data } = await orders.updateStausOrder(orderId, { statusId });
      console.log(data);
      setRerender(!Rerender);
      notifications.show({
        message: 'Order status updated successfully!',
        color: 'green',
      });
    } catch (error) {
      notifications.show({
        message: `Failed to update order status: ${error.message}`,
        color: 'red',
      });
    }
  };
  // ------------------ update status order  -------------------
  
  



  // ------------------ Call Model ----------------------
    const CallModelComponent = ({ closeModal, id }) => {
      const [history, setHistory] = useState([]); // State for order history
      const [loadingHistory, setLoadingHistory] = useState(false); // Loading state

      const [timer, setTimer] = useState(0); // Timer value in seconds
      const [isRunning, setIsRunning] = useState(false); // Timer running state

      const formCreate = useForm({
        initialValues: {
          status: '',
          agent_note: '',
        },
        validate: {
          status: (value) =>
            value.trim().length === 0 ? 'Status is required' : null,
          agent_note: (value) =>
            value.trim().length < 5
              ? 'Agent note must be at least 5 characters long'
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
          console.error('Error fetching order history:', error.message)
        } finally {
          setLoadingHistory(false);
        }
      };

      // Timer Logic
      useEffect(() => {
        fetchHistory(); // Fetch history on component mount
        let interval;
        if (isRunning) {
          interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
        }
        return () => clearInterval(interval);
      }, [isRunning]);

      const handleStartPause = () => setIsRunning((prev) => !prev);
      const handleReplay = () => {
        setTimer(0);
        setIsRunning(false);
      };

      const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
      };

      const handleSubmit = (values) => {
        console.log('Form Values:', values);
        console.log('Timer Value:', timer);
        closeModal();
      };

      return (
        <div>
          {loadingHistory ? (
            <Center style={{ height: '10vh' }}>
              <Loader color="blue" type="bars" />
            </Center>
          ) : (
            <>
              <form onSubmit={formCreate.onSubmit(handleSubmit)} hidden>
                {/* Timer */}
                <div style={{ marginBottom: '16px' }}>
                  <Text size="sm" weight={500}>
                    Timer: {formatTime(timer)}
                  </Text>
                  <Group spacing="xs" mt="sm">
                    <Button onClick={handleStartPause} variant="outline">
                      {isRunning ? 'Pause' : 'Start'}
                    </Button>
                    <Button onClick={handleReplay} color="red" variant="outline">
                      Replay
                    </Button>
                  </Group>
                </div>

                {/* Status */}
                <NativeSelect
                  label="Status"
                  placeholder="Select status"
                  withAsterisk
                  data={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'failed', label: 'Failed' },
                  ]}
                  {...formCreate.getInputProps('status')}
                />

                {/* Agent Note */}
                <Textarea
                  label="Agent Note"
                  placeholder="Add your note here..."
                  withAsterisk
                  mt="sm"
                  {...formCreate.getInputProps('agent_note')}
                />

                {/* Submit Button */}
                <Button type="submit" fullWidth mt="md">
                  Submit
                </Button>

                {/* Cancel Button */}
                <Button fullWidth mt="md" variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
              </form>


              {/* History Timeline */}
              <div>
                <Paper withBorder radius="md" shadow="sm" p="xl">
                  {history.length === 0 ? (
                    // Display this message if history is empty
                    <Text color="dimmed" size="sm" align="center">
                      No history yet.
                    </Text>
                  ) : (
                    // Render the Timeline if there are history items
                    <Timeline
                      bulletSize={30}
                      lineWidth={2}
                      styles={{
                        itemBullet: {
                          backgroundColor: '#334ed5ff',
                        },
                      }}
                    >
                      {history.map((item) => (
                        <Timeline.Item
                          key={item.id}
                          title={
                            <Group spacing="sm">
                              <Text weight={700} size="lg">
                                {item.reason.reason || 'No reason provided'}
                              </Text>
                              <Text size="xs" color="dimmed">
                                {item.created_at}
                              </Text>
                            </Group>
                          }
                        >
                          <Group align="center" spacing="sm" mt="xs">
                            <Avatar size={30} radius="xl" color="blue">
                              {item.agent?.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <Text weight={500} size="md">
                              {item.agent?.name || 'Unknown Agent'}
                            </Text>
                          </Group>

                          <Text color="dimmed" size="sm" mt="xs">
                            {item.note || 'No additional notes available'}
                          </Text>
                          <Text size="sm" mt="xs">
                            <strong>Time Taken:</strong>{' '}
                            <span
                              style={{
                                background: '#4c6ef5',
                                padding: '4px 8px',
                                borderRadius: '8px',
                                color: '#fff',
                              }}
                            >
                              {item.timetook || 'N/A'}
                            </span>
                          </Text>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  )}
                </Paper>
              </div>

            </>
          )
          
          }
        </div>
      );
    };

    const CallModal = (id) => {
      modals.open({
        title: 'Order History',
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
      return (
        <Table.Tr key={row.id} 
        >

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
                  <Tooltip label={copied ? 'Copied!' : 'Copy tracking'} withArrow position="right">
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
            <Group  style={{ flexWrap: 'nowrap' }}>
              <ActionIcon style={{background:'#dee2e6' , border: '0.1px dashed #222426'}} variant="subtle" color="gray" onClick={()=>{ CallModal(row.id) }}>
                  <IconHistory style={{ width: '16px', height: '16px' }} stroke={1.5} />
              </ActionIcon>

                  {
                    row.archive === 0 ? (
                    <NativeSelect
                      placeholder=""
                      defaultValue={row.status.id.toString()}
                      data={StatusOrdersdata}
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
                  ) : 
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
                  }  

            </Group>
          </Table.Td>

          <Table.Td 
            style={{
              whiteSpace: 'nowrap',
            }}
          >
              {row.external_id}
          </Table.Td>


          <Table.Td
              style={{
              whiteSpace: 'nowrap',
            }}
          >
              {row.client_name}
          </Table.Td>

          <Table.Td
            style={{
              whiteSpace: 'nowrap',
            }}
          >
              {row.client_lastname}
          </Table.Td>


          <Table.Td
            style={{
              whiteSpace: 'nowrap',
            }}
          >
              {row.phone}
          </Table.Td>


          <Table.Td>
            <span style={{border:'black dashed 1px' , padding:5 , borderRadius:8 , color:'black' , whiteSpace: 'nowrap',}}>
              {user.id === row.created_by.id ? 'Me' : row.created_by.name}
            </span>
          </Table.Td>
          
          <Table.Td>
            <span style={{border:'black dashed 1px' , padding:5 , borderRadius:8 , color:'black' ,whiteSpace: 'nowrap',}}>
              {row.affected_to.name}
            </span>
          </Table.Td>

          <Table.Td>
            <Group gap={5} justify="flex-start" style={{ flexWrap: 'nowrap' }}>
              
              { row.product_url !== null ?
                <ActionIcon color="gray" onClick={()=>{ window.open(row.product_url, '_blank'); }}>
                  <IconUnlink style={{ width: '16px', height: '16px' }} stroke={1.5} />
                </ActionIcon>
                : 
                <ActionIcon color='black'>
                  <IconLinkOff style={{ width: '16px', height: '16px' }} stroke={1.5} />
                </ActionIcon>
              }
              
              {
                row.archive === 0 ? (
                  <ActionIcon variant="subtle" color="gray" onClick={()=>{ UpdateOrderModal(row.id) }}>
                    <IconPencil style={{ width: '16px', height: '16px' }} stroke={1.5} />
                  </ActionIcon>
                ): null
              }

              { row.status.status === "En préparation" ?
                <>
                  <ActionIcon variant="subtle" color="red" onClick={()=>{ DeleteOrderModal(row.id) }}>
                    <IconTrash style={{ width: '16px', height: '16px' }} stroke={1.5}  />
                  </ActionIcon>
                </>
                : null
              }
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
            <Skeleton height={16} width="60%" />
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
          Orders Management
        </Text>
        <SimpleGrid cols={{ base: 1, sm: 1 }} spacing="lg">
          {/* Actions Section */}
          <SimpleGrid cols={{ base: 1, sm: 3 }} >
            


              {/* add orders */}
              <Paper style={styleCard}>
                    <Flex gap="sm" align="center">
                        <Button onClick={CreateOrderModal} fullWidth variant="filled" color="blue" >
                          Add Order
                        </Button>
                        <Button onClick={ImportOrdersModal} fullWidth variant="outline" color='red'>
                          Import
                        </Button>
                        <Button onClick={exportOrders} fullWidth variant="outline">
                          Export
                        </Button>
                    </Flex>
              </Paper>


              <Paper style={styleCard}>
                    <Flex gap="sm" align="center">
                    {
                      TaskOrder ? 
                      <>
                        <Button onClick={()=>{changeOrderTask()}} fullWidth leftSection={<IconList stroke={2} />} variant="outline" color="red" >
                          Tasks
                        </Button>
                      </>
                      :
                      <>
                        <Button onClick={()=>{changeOrderTask()}} fullWidth leftSection={<IconPackage stroke={2} />} variant="outline" color="blue" >
                          Orders
                        </Button>
                      </>
                    }
                    </Flex>
              </Paper>


              {/* search */}
              <Paper style={styleCard}>
                  <form style={{ width: '100%' }} onSubmit={formSearch.onSubmit(handleSearch)}>
                    <TextInput
                      size="sm"
                      radius="md"
                      placeholder="Search for orders..."
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
                          <Table.Th>Delivery Company</Table.Th>
                          <Table.Th>Tracking</Table.Th>
                          <Table.Th>status</Table.Th>
                          <Table.Th>External Id</Table.Th>
                          <Table.Th>Name</Table.Th>
                          <Table.Th>Lastname</Table.Th>
                          <Table.Th>Phone</Table.Th>
                          <Table.Th>creator</Table.Th>
                          <Table.Th>Agent</Table.Th>
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
                                <Table.Th>Delivery Company</Table.Th>
                                <Table.Th>Tracking</Table.Th>
                                <Table.Th>status</Table.Th>
                                <Table.Th>External Id</Table.Th>
                                <Table.Th>Name</Table.Th>
                                <Table.Th>Lastname</Table.Th>
                                <Table.Th>Phone</Table.Th>
                                <Table.Th>creator</Table.Th>
                                <Table.Th>Agent</Table.Th>
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
                              <Table.Th>Delivery Company</Table.Th>
                              <Table.Th>Tracking</Table.Th>
                              <Table.Th>status</Table.Th>
                              <Table.Th>External Id</Table.Th>
                              <Table.Th>Name</Table.Th>
                              <Table.Th>Lastname</Table.Th>
                              <Table.Th>Phone</Table.Th>
                              <Table.Th>creator</Table.Th>
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
  