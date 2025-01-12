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
    
      // Initialize the form with the agent's existing data
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
            message: 'order updated successfully!',
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
            message: error?.response?.data?.message || 'Failed to update order. Please try again.',
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
          <TextInput
            disabled
            label="Delivery Company"
            mt="sm"
            placeholder=""
            value={order?.delivery_company.name}
          />
    
          {/* Tracking */}
          <TextInput
            disabled
            label="Tracking"
            mt="sm"
            value={order?.tracking}
          />
    
          {/* External ID */}
          <TextInput
            disabled
            label="External ID"
            withAsterisk
            mt="sm"
            placeholder="web5010"
            value={order?.external_id}
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

        const filteredStatusOrders = statusOrdersdata.map((item) => ({
          value: item.value, // Keep the original value
          label: item.label, // Keep the original label
          disabled: item.label === "Tentative échouée" || item.label === "En attente du client" || item.label === "Échec livraison", // Disable specific items
        }));
        setStatusOrderIndex(filteredStatusOrders);

      } catch (error) {
        notifications.show({ message: 'Error get status orders data:' + error , color: 'red' });
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
        note: "Order status updated", // Optional: You can add additional notes here
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
        message: 'Order status updated and history created successfully!',
        color: 'green',
      });
      
    } catch (error) {
      // Handle error and show notification
      notifications.show({
        message: `Failed to update order status or create history: ${error.message}`,
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
    const [statusOrder , setStatusOrder] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState('');

    const formCreate = useForm({
      initialValues: {
        status_order_id: '',
        reason_id: '',
        note: '',
        history_judge:true,
        order_id:id
      },
      validate: {
        status_order_id: (value) =>
          value.trim().length === 0 ? 'Status is required' : null,
        note: (value) =>
          value.trim().length < 2
            ? 'note must be at least 2 characters long'
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

    // Fetch calls Resons
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
        console.error('Error fetching order history:', error.message)
      } finally {
        setLoadingHistory(false);
      }
    };


    // handle status orders data (filtered)
    const handleStatusOrdersData = () => {
      const filteredStatusOrders = StatusOrdersdata.filter(
        (item) =>
          item.label === "Tentative échouée" ||
          item.label === "En attente du client" ||
          item.label === "Échec livraison"
      );
    
      setStatusOrder((prevState) => [...prevState, ...filteredStatusOrders]);
    };

    // handle submit call form
    const handleSubmit = async (values) => {
      try {
        // Make API call add history order
        await historyOrders.post(values);

        // Make API call update order status
        await orders.updateStausOrder(id , { statusId : values.status_order_id});
    
        // Show success notification
        notifications.show({
          message: 'History Order created successfully!',
          color: 'green',
        });
        
        setRerender(!Rerender);
    
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

    useEffect(() => {
      console.log(selectedStatus)
      formCreate.setFieldValue('reason', '');
    }, [selectedStatus]);
    

    useEffect(() => {
      handleStatusOrdersData();
      fetchReasonscalls();
      fetchHistory();
    }, []);


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
                    label="Status Order"
                    placeholder="Select status"
                    withAsterisk
                    data={[{ value: '', label: 'Select status' , disabled: true }, ...statusOrder]} // Add an empty option
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
                      label="Reason"
                      placeholder="Select Reason"
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
                    placeholder="Add your note here..."
                    withAsterisk
                    mt="sm"
                    {...formCreate.getInputProps('note')}
                  />


                  {/* Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', whiteSpace: 'nowrap', marginTop: '1rem' }}>
                    <Button fullWidth variant="outline" onClick={closeModal}>
                      Cancel
                    </Button>
                    <Button fullWidth type="submit">
                      Submit
                    </Button>
                  </div>

            </form>


            {/* History Timeline */}
            <div>
              <Paper withBorder radius="md" shadow="sm" p="xl" mt={20}>
                {history.length === 0 ? (
                  // Display this message if history is empty
                  <Text color="dimmed" size="sm" align="center">
                    No history yet.
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
                            {
                              item.status?.status ? 
                                `${item.status.status}${item.reason?.reason ? ` (${item.reason.reason})` : ''}`
                              : 'No status provided'
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
                            {item.agent?.name || 'Unknown Agent'}
                          </Text>
                            {
                              (
                                 item.history_judge == true && item.validator !== null ? 
                                    (
                                      <Badge variant="light" color="green" radius="sm">validate by: {item.validator?.name}</Badge>
                                    )
                                  : item.history_judge == true ?
                                  (
                                      <Badge variant="light" color="yellow" radius="sm">Pending validation...</Badge>
                                  ) : null
                              )
                            }
                        </Group>

                        {
                          item.history_judge == true ? (
                            <>
                              <Text color="dimmed" size="sm" mt="xs">
                                {item.note || 'No additional notes available'}
                              </Text>
                              {/* 
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
                              */}
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
              {row.created_by.name}
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
                    <ActionIcon variant="subtle" color="gray" onClick={() => { UpdateOrderModal(row.id) }}>
                        <IconPencil style={{ width: '16px', height: '16px' }} stroke={1.5} />
                    </ActionIcon>
                ) : (
                    <Badge
                        variant="filled"
                        color="black"
                        leftSection={<IconArchive style={{ width: '14px', height: '14px' }} />}
                        styles={{
                            root: {
                                padding: '4px 8px',
                                height: 'auto',
                                borderRadius: '4px',
                                cursor: 'default',
                            },
                        }}
                    >
                        Archived
                    </Badge>
                )
              }
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
            <Skeleton circle height={24} width={24} />
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
          <SimpleGrid cols={{ base: 1, sm: 2 }} >
            


              {/* add orders */}
              <Paper style={styleCard}>
                    <Flex gap="sm" align="center">
                        <Button onClick={exportOrders} fullWidth variant="outline">
                          Export
                        </Button>
                        
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
  