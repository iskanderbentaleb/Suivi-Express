import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Group,
  Modal,
  Pagination,
  Paper,
  rem,
  ScrollArea,
  Select,
  SimpleGrid,
  Skeleton,
  Text,
  Textarea,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconArrowRight,
  IconBox,
  IconSearch,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { messages } from "../../../../services/api/agent/messages";
import { notifications } from "@mantine/notifications";
// import echo from "../../../../services/resources/echo";
import { useUserContext } from "../../../../context/userContext";
import Pusher from 'pusher-js';
// import Echo from "laravel-echo";
import axiosClient from "../../../../services/api/axios";

import newMessageSound from "./../../../../assets/sound/message.mp3"; // ✅ Import your sound file
import Echo from 'laravel-echo';
import axios from "axios";
import { modals } from "@mantine/modals";
import { orders } from '../../../../services/api/agent/orders';


const styleCard = {
  background: "white",
  borderRadius: rem(8),
  padding: rem(10),
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
};

const DesktopViewMessages = ({ selectedMessages  , setSelectedMessages}) => {
  const theme = useMantineTheme();
  
  return (
    <Grid.Col span={{ base: 12, md: 8 }} style={{ height: "75vh", overflow: "hidden" }}>
      <Paper
        p="lg"
        shadow="sm"
        style={{ height: "100%", backgroundColor: theme.white, position: "relative" }}
      >
        {selectedMessages ? (
          <>
            <UserInfo selectedMessages={selectedMessages} />
            <MessagesList selectedMessages={selectedMessages} setSelectedMessages={setSelectedMessages} />
            <ResponseSection orderTracking={selectedMessages[0].order.tracking} />
          </>
        ) : (
          <NoMessageSelected/>
        )}
      </Paper>
    </Grid.Col>
  );
};

const PhoneViewMessages = ({ selectedMessages, setSelectedMessages }) => {
  const theme = useMantineTheme();

  return (
    <Modal
      opened={!!selectedMessages}
      onClose={() => setSelectedMessages(null)}
      title="Message"
      fullScreen
      transition="fade"
      transitionDuration={500}
      overlayProps={{ blur: 3, backgroundOpacity: 0.7 }}
      styles={{
        content: {
          maxWidth: "100vw",
          maxHeight: "100vh",
          padding: 0,
          display: "flex",
          flexDirection: "column",
        },
        body: {
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      {Array.isArray(selectedMessages) && selectedMessages.length > 0 && (
        <>
          <UserInfo selectedMessages={selectedMessages} />
          <MessagesList selectedMessages={selectedMessages} setSelectedMessages={setSelectedMessages} />
          <ResponseSection orderTracking={selectedMessages[0].order.tracking} />
        </>
      )}
    </Modal>
  );
};

const UserInfo = ({ selectedMessages }) => {
  const theme = useMantineTheme();
  
  return (
    <Box
      style={{
        padding: "16px",
        borderBottom: `1px solid ${theme.colors.gray[3]}`,
        backgroundColor: theme.colors.gray[0],
        position: "sticky", // Fixed at the top
        top: 0,
        zIndex: 1, // Ensure it stays above other content
      }}
    >
      <Group align="center" spacing="sm">
        <Avatar radius="sm" color="black">
          <IconBox stroke={2} />
        </Avatar>
        <div>
          <Text size="sm" weight={500} color={theme.colors.gray[7]}>
            {selectedMessages[0].order.tracking}
          </Text>
          <Text size="xs" color="dimmed">
            {selectedMessages[0].order.status.status}
          </Text>
        </div>
      </Group>
    </Box>
  );
};

const MessagesList = ({ selectedMessages, setSelectedMessages }) => {
  const { user } = useUserContext();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const orderId = selectedMessages[0].order.id ;
    
    console.log("✅ Connecting to Pusher...");

    const echo = new Echo({
      broadcaster: "pusher",
      key: import.meta.env.VITE_PUSHER_APP_KEY,
      cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
      forceTLS: true,
      encrypted: true,
      namespace: "App.Events",
      withCredentials: true,
      authEndpoint: import.meta.env.VITE_BACKEND_URL + "/api/broadcasting/auth",
      authorizer: (channel) => ({
        authorize: (socketId, callback) => {
          axiosClient
            .post("/api/broadcasting/auth", { socket_id: socketId, channel_name: channel.name })
            .then((response) => {
              console.log("✅ Pusher Auth Success:", response.data);
              callback(false, response.data);
            })
            .catch((error) => {
              console.error("🔴 Pusher Auth Failed:", error);
              callback(true, error);
            });
        },
      }),
    });

    const channel = echo.private(`order-room.${orderId}`);

    channel.on("pusher:subscription_succeeded", () => {
      console.log(`✅ Successfully subscribed to order-room.${orderId}`);
    });

    channel.on("pusher:subscription_error", (error) => {
      console.error("❌ Subscription Error:", error);
    });

    channel.listen(".my-event", (data) => {
      console.log("🔴 New message received:", data);

      // ✅ Play notification sound
      const audio = new Audio(newMessageSound);
      audio.play().catch((error) => console.error("🔊 Sound play error:", error));

      setSelectedMessages((prev) => [...prev, data]);
    });

    return () => {
      channel.stopListening(".my-event");
      echo.leave(`order-room.${orderId}`);
      echo.disconnect();
    };
  }, [user.id, setSelectedMessages]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedMessages]);

  return (
    <Box
      style={{
        flex: 1, // Take up remaining space
        padding: "16px",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        height:'60vh',
        marginBottom:'50px',
        paddingBottom : '70px'
      }}
    >
      {selectedMessages.map((msg) => (
        <MessageBubble key={msg.id} msg={msg} user={user} />
      ))}
      <div ref={messagesEndRef} />
    </Box>
  );
};

const MessageBubble = ({ msg, user }) => {
  const isUserAgent = msg.sender_agent?.id === user?.id;
  const isUserAdmin = msg.sender_admin?.id === user?.id;
  const isUserMessage = isUserAgent || isUserAdmin;
  const alignMessage = isUserAgent ? "flex-end" : "flex-start";
  const bubbleColor = isUserAgent ? "#323d49" : "#F1F3F5";
  const textColor = isUserAgent ? "#FFF" : "#333";
  const senderName = msg.sender_admin?.name || msg.sender_agent?.name || "Unknown";

  return (
    <Group align="flex-end" spacing="sm" style={{ justifyContent: alignMessage }}>
      {!isUserMessage && senderName && (
        <Avatar radius="xl" color="gray[8]">
          {senderName[0]?.toUpperCase()} 
        </Avatar>
      )}
      <Paper
        p="sm"
        radius="lg"
        style={{
          backgroundColor: bubbleColor,
          color: textColor,
          maxWidth: "60%",
          padding: "10px 14px",
          boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
          borderRadius: isUserAgent ? "20px 20px 0px 20px" : "20px 20px 20px 0px",
          alignSelf: alignMessage,
        }}
      >
        {/* <Text size="xs" weight={100}>{}</Text> */}
        <Text size="sm" weight={500}>{senderName + " : " + msg.message}</Text>
        <Text size="xs" color="#bbbbbb" align="right" mt={4}>
          {msg.created_at}
        </Text>
      </Paper>
      {isUserMessage && senderName && (
        <Avatar radius="xl" color="gray">
          {senderName[0]?.toUpperCase()}
        </Avatar>
      )}
    </Group>
  );
};

const ResponseSection = ({ orderTracking }) => {
  const theme = useMantineTheme();
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)"); // Detect mobile devices

  const handleResponseChange = (event) => {
    setResponse(event.target.value);
  };

  const handleSendResponse = async () => {
    const trimmedResponse = response.trim();
    if (!trimmedResponse) return;

    setLoading(true);

    try {
      const { data } = await messages.sendMessage({
        tracking: orderTracking,
        message: trimmedResponse,
      });

      console.log("Message sent:", data);
      // notifications.show({
      //   message: "Message sent successfully!",
      //   color: "green",
      // });
      setResponse("");
    } catch (error) {
      console.error("Error sending message:", error);
      notifications.show({
        message: "Message sent failed!",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      style={{
        position: isMobile ? "fixed" : "absolute", // Fixed on mobile, absolute on desktop
        bottom: 0,
        left: 0,
        right: 0,
        padding: "16px",
        borderTop: `1px solid ${theme.colors.gray[3]}`,
        backgroundColor: theme.colors.gray[0],
        display: "flex",
        flexDirection: "row", // Change to row for inline layout
        gap: "12px",
        alignItems: "center", // Align items vertically
      }}
    >
      <TextInput
        placeholder="Type your response..."
        value={response}
        onChange={handleResponseChange}
        radius="md"
        size="md"
        disabled={loading}
        style={{ flex: 1 }} // Take up remaining space
        styles={{
          input: {
            backgroundColor: theme.white,
            borderColor: theme.colors.gray[3],
          },
        }}
      />
      <Button
        onClick={handleSendResponse}
        size="md"
        radius="md"
        disabled={response.trim().length === 0 || loading}
        loading={loading}
        styles={{
          root: {
            backgroundColor: "#323d49", // Dark color matching the bubble
            color: theme.white,
            "&:hover": {
              backgroundColor: "#2a333d", // Slightly darker on hover
            },
            "&:disabled": {
              backgroundColor: theme.colors.gray[5], // Gray when disabled
              color: theme.colors.gray[7],
            },
          },
        }}
      >
        Send
      </Button>
    </Box>
  );
};

const NoMessageSelected = () => (
  <Text
    size="lg"
    color="dimmed"
    align="center"
    style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%" }}
  >
    <img src="/select-message.svg" alt="No messages" style={{ width: "300px" }} />
    Select a message to view and respond
  </Text>
);





// ======= Parent Component  ==========
export default function Messages() {
  // const [selectedTab, setSelectedTab] = useState("receive");
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [selectedMessages, setSelectedMessages] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [response, setResponse] = useState("");
  const [Rerender, setRerender] = useState(true);
  const [isRead, setisRead] = useState("all"); // 'all', 'read', 'unread'
  const [typeMessage, setTypeMessage] = useState("receive"); // 'receive' , 'sent'
  const [inboxMessages, setInboxMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: 1200px)`);

  const formSearch = useForm({
    initialValues: { search: "" },
  });

  const handleSearch = (values) => {
    const trimmedSearch = values.search.trim().toLowerCase();
    if (trimmedSearch !== search) {
      setSearch(trimmedSearch);
      fetchInboxMessages(1, trimmedSearch); // Fetch messages with the new search term
    }
  };

  // Fetch messages for the selected order
  const handleMessageSelect = async (orderId) => {
    const { data } = await messages.selectedOrderMessagesInbox(orderId);
    setSelectedOrder(orderId);
    setSelectedMessages(data.data);
    setResponse(""); // Reset response input
  };

  //============ Fetch messages from the API ======================
  const fetchInboxMessages = async (page = 1, searchTerm = "") => {
    setLoading(true);
    try {
      const { data } = await messages.inbox(page, searchTerm , isRead , typeMessage);
  
      // Transform API data to match UI needs
      const formattedMessages = Object.values(data.data).map(item => ({
        ...item,
        id: item.order.id, // Ensure each message has a unique identifier
        read: item.latest_mail.is_read === 1,
      }));
  
      setInboxMessages(formattedMessages); // Update state with grouped messages
      setTotalPages(Math.ceil(data.meta.total / data.meta.per_page)); // Correct total pages calculation

    } catch (error) {
      notifications.show({ message: "Error fetching data: " + error, color: "red" });
    } finally {
      setLoading(false);
    }
  };

  

  //======= here we open model for create a new message for orders======
  const CreateMessagesForm = ({ closeModal }) => {
        
    const [Element, setElement] = useState([]);
    
    
    const formCreate = useForm({
      initialValues: {
        tracking: '',
        message: '',
      },
      validate: {  
        tracking: (value) =>
          value.trim().length === 0 ? 'tracking is required' : null,

        message: (value) =>
          value.trim().length === 0 ? 'message is required' : null, // Nullable, so no error if empty
      },
    });
    

    const handleSubmit = async (values) => {
      try {
        // Make API call to create the agent
        const { data } = await messages.sendMessage(values);
    
        console.log(data);
        setRerender(!Rerender);
        // Show success notification
        notifications.show({
          message: 'Messages sent successfully!',
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




    const getOrdersDATA = async (page = 1 ,  search = '') => {
      try {
        const response = await orders.index(page, search); // Pass search value
        const data = response.data.data.map((order) => ({
          value: order.tracking, // Use `id` as the value
          label: order.tracking,         // Use `tracking` as the label
        }));
        setElement(data); // Update the `agentsElement` state
      } catch (error) {
        notifications.show({ message: 'Error fetching agents: ' + error, color: 'red' });
      }
    };


    useEffect(() => {
      getOrdersDATA(1,'')
    }, []);




    return (
        <form onSubmit={formCreate.onSubmit(handleSubmit, handleError)}>
          {/* Affected To */}
          <Select
            label="Tracking"
            withAsterisk
            placeholder="Tracking..."
            checkIconPosition="right"
            data={Element}
            searchable
            mt="sm"
            onSearchChange={(search) => getOrdersDATA(1 ,search)} // Pass the search value
            nothingFoundMessage="Nothing found..."
            {...formCreate.getInputProps('tracking')}
          />
          
          {/* Product URL */}
          <Textarea
            label="Message"
            mt="sm"
            placeholder="Message..."
            {...formCreate.getInputProps('message')}
          />


          {/* Submit Button */}
          <Button type="submit" fullWidth mt="md">
            Send
          </Button>

          {/* Cancel Button */}
          <Button fullWidth mt="md" variant="outline" onClick={closeModal}>
            Cancel
          </Button>
        </form>
    );
  };

  const CreateMessagesModal = () => {
    modals.open({
      title: 'Create New Message',
      centered: true,
      children: (
        <CreateMessagesForm closeModal={() => modals.closeAll()} />
      ),
    });
  };
  //======= here we open model for create a new message for orders======




  useEffect(() => {
    fetchInboxMessages(currentPage, search);
  }, [currentPage , Rerender , search , isRead , typeMessage]);

  // Skeleton component for loading state
  const SkeletonMessage = () => (
    <Paper p="md" mb="sm" style={{ cursor: "pointer" }}>
      <Group align="center" spacing="sm" style={{ marginBottom: "8px" }}>
        <Skeleton height={20} width={60} radius="sm" />
        <Skeleton height={20} width={120} radius="sm" />
      </Group>
      <Skeleton height={16} width="80%" radius="sm" style={{ marginBottom: "4px" }} />
      <Skeleton height={12} width="60%" radius="sm" style={{ marginBottom: "8px" }} />
      <Box style={{ display: "flex", justifyContent: "flex-end" }}>
        <Skeleton height={20} width={80} radius="lg" />
      </Box>
    </Paper>
  );

  return (
    <>

      <Text fw={700} fz="xl" mb="md">
        Messages
      </Text>


        {/* Actions Section */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
          <Paper style={styleCard}>
            <Flex gap="sm" align="center">
              <Button
                fullWidth
                variant={typeMessage === "receive" ? "filled" : "outline"}
                color="blue"
                onClick={() => setTypeMessage("receive")}
              >
                RECEIVE
              </Button>
              <Button
                fullWidth
                variant={typeMessage === "sent" ? "filled" : "outline"}
                color="teal"
                onClick={() => setTypeMessage("sent")}
              >
                SENT
              </Button>
            </Flex>
          </Paper>
        </SimpleGrid>




      {/* Message List and Selected Message */}
      <Grid style={{ height: "80vh", overflow: "hidden" , marginTop:'15px' }}>
        {/* Left Side: Message List */}
        <Grid.Col span={{ base: 12, md: isMobile ? 12 : 4 }} style={{ height: "75vh" }}>
          <Paper
            p="lg"
            shadow="sm"
            style={{
              height: "100%",
              borderRadius: theme.radius.md,
              display: "flex",
              flexDirection: "column",
              backgroundColor: theme.white,
            }}
          >
            {/* Header */}
            <Box
              style={{
                backgroundColor: theme.colors.gray[0],
                padding: "16px",
                borderRadius: theme.radius.md,
                marginBottom: "16px",
              }}
            >
              <Group mb="lg" spacing="sm" noWrap>
                <Button
                  variant={isRead === "all" ? "filled" : "outline"}
                  onClick={() => setisRead("all")}
                  size="xs"
                  color="blue"
                >
                  All
                </Button>
                <Button
                  variant={isRead === "read" ? "filled" : "outline"}
                  onClick={() => setisRead("read")}
                  size="xs"
                  color="blue"
                >
                  Read
                </Button>
                <Button
                  variant={isRead === "unread" ? "filled" : "outline"}
                  onClick={() => setisRead("unread")}
                  size="xs"
                  color="blue"
                >
                  Unread
                </Button>

                <Button size="xs" color="teal"
                variant="outline"
                onClick={CreateMessagesModal}
                > Send Message </Button>
              
              </Group>

              {/* Search Form */}
              <form style={{ width: "100%" }} onSubmit={formSearch.onSubmit(handleSearch)}>
                <TextInput
                  size="sm"
                  radius="md"
                  placeholder="Search for messages..."
                  rightSectionWidth={42}
                  leftSection={<IconSearch size={18} stroke={1.5} />}
                  {...formSearch.getInputProps("search")}
                  rightSection={
                    <ActionIcon size={28} radius="xl" variant="filled" type="submit">
                      <IconArrowRight size={18} stroke={1.5} />
                    </ActionIcon>
                  }
                />
              </form>
            </Box>



            {/* Body */}
            <Box
              style={{
                flex: 1,
                overflowY: "auto",
                backgroundColor: theme.white,
                padding: "8px",
              }}
            >
              {loading ? (
                // Skeleton Loading Effect while fetching data
                <ScrollArea>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonMessage key={index} />
                  ))}
                </ScrollArea>
              ) : inboxMessages.length > 0 ? (
                <ScrollArea>
                  {inboxMessages.map((message) => (
                    <Box key={message.id} style={{ position: "relative", marginBottom: "16px" }}>
                      {/* First Layer: White Paper (Stacked Effect) */} 
                      {
                        message.mail_count > 1 && (
                        <Paper 
                          p="md"
                          style={{
                            backgroundColor: theme.white,
                            border: `1px solid ${theme.colors.gray[3]}`,
                            borderRadius: theme.radius.md,
                            boxShadow: theme.shadows.sm,
                            position: "absolute",
                            top: 4,
                            left: 4,
                            right: 4,
                            bottom: 4,
                            zIndex: -1, // Behind the top layer
                          }}
                        />
                      )}
                      {/* Second Layer: Actual Message */}
                      <Paper
                        p="md"
                        onClick={() => handleMessageSelect(message.id)}
                        style={{
                          cursor: "pointer",
                          backgroundColor: selectedMessages?.[0]?.order?.id === message?.order?.id  ? theme.colors.gray[1] : theme.white,
                          border: `1px solid ${theme.colors.gray[3]}`,
                          borderRadius: theme.radius.md,
                          transition: "all 0.2s ease-in-out",
                          boxShadow: theme.shadows.sm,
                          ":hover": {
                            backgroundColor: theme.colors.gray[1],
                            transform: "translateX(4px)",
                            boxShadow: theme.shadows.md,
                          },
                        }}
                      >
                        {/* Sender + Unread Status */}
                        <Group align="center" spacing="sm" style={{ marginBottom: "8px" }}>
                          <Text
                            weight={!message.read ? 700 : 500}
                            size="sm"
                            color={theme.colors.gray[7]}
                            style={{ flex: 1 }}
                          >
                            {
                                message.latest_mail.sender_agent
                              ? message.latest_mail.sender_agent.name
                              : message.latest_mail.sender_admin
                              ? message.latest_mail.sender_admin.name
                              : "Unknown Sender"
                            }
                          {!message.read && (
                            <span
                              style={{
                                width: "8px",
                                height: "8px",
                                backgroundColor: "#ff3838",
                                borderRadius: "50%",
                                display: "inline-block",
                                marginLeft: "8px", // Adjust spacing
                              }}
                            ></span>
                          )}
                          </Text>
                          {/* Display message count if multiple messages exist */}
                          {message.mail_count > 1 && (
                            <Badge color="teal" size="xs" radius="sm">
                              {message.mail_count} messages
                            </Badge>
                          )}
                        </Group>

                        {/* Subject */}
                        <Text size="xs" color="dimmed" weight={!message.read ? 600 : 400} style={{ marginBottom: "4px" }}>
                          {"Order #" + message.order.tracking + " || "}
                          <span style={{ border: "gray 0.4px", padding: "3px", borderRadius: "5px" }}>
                            {message.order.status.status}
                          </span>
                        </Text>

                        {/* Timestamp */}
                        <Text size="xs" color="gray" style={{ marginBottom: "8px" }}>
                          {message.latest_mail.message.length > 15
                            ? message.latest_mail.message.substring(0, 15) + "..."
                            : message.latest_mail.message}
                        </Text>


                        {/* Status Badge */}
                        <Box style={{ display: "flex", justifyContent: "flex-end" }}>
                          <Text size="xs" color="gray" style={{ marginBottom: "8px" }}>
                            {message.latest_mail.created_at}
                          </Text>
                        </Box>
                      </Paper>
                    </Box>
                  ))}
                </ScrollArea>
              ) : (
                // Centered "No Messages Found" Text
                <Box
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "50vh",
                    textAlign: "center",
                  }}
                >
                
                  <Text size="lg" color="gray">
                    No messages found
                  </Text>
                  
                </Box>
              )}
            </Box>



            {/* Footer */}
            <Box
              style={{
                backgroundColor: theme.colors.gray[0],
                padding: "16px",
                borderRadius: theme.radius.md,
                marginTop: "16px",
              }}
            >
              {/* Pagination */}
              <Pagination
                total={totalPages}
                page={currentPage}
                onChange={(page) => {
                  setCurrentPage(page);
                  fetchInboxMessages(page, search);
                }}
                size="xs"
                color="blue"
                style={{ justifyContent: "center" }}
              />
            </Box>


          </Paper>
        </Grid.Col>

        {/* Right Side: Selected Message and Response */}
        {!isMobile ? (
          <DesktopViewMessages selectedMessages={selectedMessages} setSelectedMessages={setSelectedMessages}/>
        ) : (
          <PhoneViewMessages selectedMessages={selectedMessages} setSelectedMessages={setSelectedMessages}/>
        )}
      </Grid>
    </>
  );
}
















