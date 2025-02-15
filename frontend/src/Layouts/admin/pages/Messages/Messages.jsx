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
import { messages } from "../../../../services/api/admin/messages";
import { notifications } from "@mantine/notifications";
// import echo from "../../../../services/resources/echo";
import { useUserContext } from "../../../../context/userContext";
import axiosClient from "../../../../services/api/axios";
import Echo from 'laravel-echo';
import { orders } from '../../../../services/api/admin/orders';


const styleCard = {
  background: "white",
  borderRadius: rem(8),
  padding: rem(10),
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
};



const DesktopViewMessages = ({ selectedMessages , setOpened , setSelectedMessages}) => {
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
          <NoMessageSelected setOpened={setOpened} />
        )}
      </Paper>
    </Grid.Col>
  );
};

const PhoneViewMessages = ({ selectedMessages , setSelectedMessages }) => {
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

    const channel = echo.private(`private-messages.${user.id}`);

    channel.on("pusher:subscription_succeeded", () => {
      console.log(`✅ Successfully subscribed to private-messages.${user.id}`);
    });

    channel.on("pusher:subscription_error", (error) => {
      console.error("❌ Subscription Error:", error);
    });

    channel.listen(".my-event", (data) => {
      console.log("🔴 New message received:", data);
      setSelectedMessages((prev) => [...prev, data]);
    });

    return () => {
      channel.stopListening(".my-event");
      echo.leave(`private-messages.${user.id}`);
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
        marginBottom:'50px'
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
  const isUserAdmin = msg.sender_admin?.id === user?.id;
  const isUserAgent = msg.sender_agent?.id === user?.id;
  const isUserMessage = isUserAdmin || isUserAgent;
  const alignMessage = isUserAdmin ? "flex-end" : "flex-start";
  const bubbleColor = isUserAdmin ? "#323d49" : "#F1F3F5";
  const textColor = isUserAdmin ? "#FFF" : "#333";
  const senderName = msg.sender_admin?.name || msg.sender_agent?.name || "Unknown";

  return (
    <Group align="flex-end" spacing="sm" style={{ justifyContent: alignMessage }}>
      {!isUserMessage && senderName && (
        <Avatar radius="xl" color="blue">
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
          borderRadius: isUserAdmin ? "20px 20px 0px 20px" : "20px 20px 20px 0px",
          alignSelf: alignMessage,
        }}
      >
        <Text size="sm" weight={500}>{msg.message}</Text>
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

const NoMessageSelected = ({ setOpened }) => (
  <Text
    size="lg"
    color="dimmed"
    align="center"
    style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%" }}
  >
    <img src="/select-message.svg" alt="No messages" style={{ width: "300px" }} />
    Select a message to view and respond
    <Button size="xs" variant="outline" color="teal" onClick={() => setOpened(true)}> Send Message </Button>
  </Text>
);



const NewMessageModal = ({ opened, setOpened }) => {
  const [loading, setLoading] = useState(true);
  const [ordersList, setOrdersList] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [assignedUser, setAssignedUser] = useState("");

  // ✅ Fetch Orders from API
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await orders.index(); // Fetch orders
      setOrdersList(
        data.data.map((order) => ({
          value: order.id.toString(),
          label: `Order #${order.tracking}`,
          user: order.affected_to_user, // Store assigned user
        }))
      );
    } catch (error) {
      notifications.show({ message: "Error fetching orders: " + error, color: "red" });
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch orders when modal opens
  useEffect(() => {
    if (opened) {
      fetchOrders();
    }
  }, [opened]);

  // ✅ Handle order selection
  const handleOrderChange = (orderId) => {
    const selected = ordersList.find((order) => order.value === orderId);
    setSelectedOrder(selected);
    setAssignedUser(selected?.user?.name || "No user assigned");
  };

  return (
    <Modal opened={opened} onClose={() => setOpened(false)} title="New Message" size="lg" centered>
      <Box>
        {/* ✅ Searchable Select for Order Tracking */}
        <Select
          label="Order Tracking"
          placeholder={loading ? "Loading orders..." : "Select an order"}
          searchable
          data={ordersList}
          nothingFound="No orders found"
          required
          disabled={loading}
          onChange={handleOrderChange}
          rightSection={loading && <Loader size="sm" />}
        />

        {/* ✅ Show assigned user */}
        <TextInput label="Assigned User" value={assignedUser} disabled mt="md" />

        {/* ✅ Message Textarea */}
        <Textarea
          label="Message Content"
          placeholder="Type your message here"
          required
          mt="md"
          autosize
          minRows={4}
          maxRows={10}
        />
      </Box>
    </Modal>
  );
};




// ======= Parent Component  ==========
export default function Messages() {
  const [selectedTab, setSelectedTab] = useState("receive");
  const [loading, setLoading] = useState(true);
  const [loadingMessagesView, setLoadingMessagesView] = useState(true);
  
  const [search, setSearch] = useState("");
  const [opened, setOpened] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [response, setResponse] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'read', 'unread'
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
      const { data } = await messages.inbox(page, searchTerm , filter);
  
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



  useEffect(() => {
    fetchInboxMessages(currentPage, search);
  }, [currentPage, search , filter]);

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
                variant={selectedTab === "receive" ? "filled" : "outline"}
                color="blue"
                onClick={() => setSelectedTab("receive")}
              >
                RECEIVE
              </Button>
              <Button
                fullWidth
                variant={selectedTab === "sent" ? "filled" : "outline"}
                color="teal"
                onClick={() => setSelectedTab("sent")}
              >
                SENT
              </Button>
            </Flex>
          </Paper>
        </SimpleGrid>



      {/* create new messages */}
      <NewMessageModal opened={opened} setOpened={setOpened} />



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
                  variant={filter === "all" ? "filled" : "outline"}
                  onClick={() => setFilter("all")}
                  size="xs"
                  color="blue"
                >
                  All
                </Button>
                <Button
                  variant={filter === "read" ? "filled" : "outline"}
                  onClick={() => setFilter("read")}
                  size="xs"
                  color="blue"
                >
                  Read
                </Button>
                <Button
                  variant={filter === "unread" ? "filled" : "outline"}
                  onClick={() => setFilter("unread")}
                  size="xs"
                  color="blue"
                >
                  Unread
                </Button>

                <Button size="xs" color="teal"
                variant="outline"
                onClick={() => setOpened(true)}
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
                          {!message.read && (
                            <Badge color="blue" size="sm" radius="sm">
                              Unread
                            </Badge>
                          )}
                          <Text
                            weight={!message.read ? 700 : 500}
                            size="sm"
                            color={theme.colors.gray[7]}
                            style={{ flex: 1 }}
                          >
                            {message.latest_mail.sender_agent.name}
                          </Text>
                          {/* Display message count if multiple messages exist */}
                          {message.mail_count > 1 && (
                            <Badge color="teal" size="sm" radius="sm">
                              {message.mail_count} messages
                            </Badge>
                          )}
                        </Group>

                        {/* Subject */}
                        <Text size="sm" color="dimmed" weight={!message.read ? 600 : 400} style={{ marginBottom: "4px" }}>
                          {"Order #" + message.order.tracking + " "}
                          <span style={{ border: "gray 0.4px dashed", padding: "3px", borderRadius: "5px" }}>
                            {message.order.status.status}
                          </span>
                        </Text>

                        {/* Timestamp */}
                        <Text size="xs" color="gray" style={{ marginBottom: "8px" }}>
                          {message.latest_mail.created_at}
                        </Text>

                        {/* Status Badge */}
                        <Box style={{ display: "flex", justifyContent: "flex-end" }}>
                          <Badge
                            color={"gray"}
                            size="sm"
                            radius="lg"
                            style={{
                              border: `1px solid ${theme.colors.gray[6]}`,
                              padding: "4px 12px",
                              boxShadow: theme.shadows.xs,
                              transition: "all 0.2s ease-in-out",
                            }}
                          >
                            {message.latest_mail.status.name}
                          </Badge>
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
          <DesktopViewMessages selectedMessages={selectedMessages} setSelectedMessages={setSelectedMessages} setOpened={setOpened}/>
        ) : (
          <PhoneViewMessages selectedMessages={selectedMessages} setSelectedMessages={setSelectedMessages} setOpened={setOpened} />
        )}
      </Grid>
    </>
  );
}
















