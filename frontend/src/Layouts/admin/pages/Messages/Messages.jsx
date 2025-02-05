import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Code,
  Flex,
  Grid,
  Group,
  Modal,
  Pagination,
  Paper,
  rem,
  ScrollArea,
  Skeleton,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconArrowRight,
  IconBox,
  IconBrandTelegram,
  IconMessageCircleDown,
  IconSearch,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { messages } from "../../../../services/api/admin/messages";
import { notifications } from "@mantine/notifications";

const styleCard = {
  background: "white",
  borderRadius: rem(8),
  padding: rem(10),
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
};

export default function Messages() {
  const [loading, setLoading] = useState(true);
  const [selectedButton, setSelectedButton] = useState("inbox");
  const [search, setSearch] = useState("");
  
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

  const handleSwitchButtonSentInboxClick = (buttonName) => {
    setSelectedButton(buttonName);
  };

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

  const handleResponseChange = (event) => {
    setResponse(event.target.value);
  };

  const handleSendResponse = () => {
    alert(`Response sent: ${response}`);
    setResponse("");
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
      <Grid gutter="lg" mb="lg">
        {/* Buttons Section */}
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Paper style={styleCard}>
            <Flex gap="sm" align="center">
              <Button
                rightSection={<IconMessageCircleDown size={14} />}
                onClick={() => handleSwitchButtonSentInboxClick("inbox")}
                fullWidth
                variant={selectedButton === "inbox" ? "outline" : "light"}
              >
                Inbox
              </Button>
              <Button
                rightSection={<IconBrandTelegram size={14} />}
                onClick={() => handleSwitchButtonSentInboxClick("sent")}
                color="green"
                fullWidth
                variant={selectedButton === "sent" ? "outline" : "light"}
              >
                Sent
              </Button>
            </Flex>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Message List and Selected Message */}
      <Grid style={{ marginTop: "20px", height: "80vh", overflow: "hidden" }}>
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
              <Text size="xl" mb="lg" weight={700} color={theme.colors.gray[7]}>
                Inbox
              </Text>
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
                          backgroundColor: selectedOrder?.id === message.id ? theme.colors.gray[1] : theme.white,
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
          <Grid.Col span={{ base: 12, md: 8 }} style={{ height: "75vh", overflow: "hidden" }}>
            <Paper
              p="lg"
              shadow="sm"
              style={{
                height: "100%",
                backgroundColor: theme.white,
                position: "relative",
              }}
            >
              {selectedMessages ? (
                <>

                  {/* user info section */}
                  <Box
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      padding: "16px",
                      borderBottom: `1px solid ${theme.colors.gray[3]}`,
                      backgroundColor: theme.colors.gray[0],
                      gap: "12px",
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



                  {/* Admin and Agent Replies Section */}
                  <Box
                    style={{
                      position: "absolute",
                      top: "90px",
                      bottom: "120px",
                      left: 0,
                      right: 0,
                      padding: "16px",
                      overflowY: "auto",
                    }}
                  >
                    {selectedMessages.map((msg) => {
                      const isAgent = msg.sender_agent !== null; // Check if sender is an agent
                      const senderName = isAgent ? msg.sender_agent.name : msg.sender_admin.name ;
                      const senderInitial = senderName.charAt(0).toUpperCase() + senderName.charAt(senderName.length-1).toUpperCase() ;

                      return (
                        <Box
                          key={msg.id}
                          style={{
                            display: "flex",
                            justifyContent: isAgent ? "flex-start" : "flex-end",
                            alignItems: "center",
                            marginBottom: "16px",
                            gap: "8px",
                          }}
                        >
                          {/* Show Avatar & Sender Name for Agent Messages */}
                          {/* Show Avatar & Sender Name for Agent Messages */}
                          {isAgent && (
                            <Avatar radius="sm" color="blue">
                              <Text size="xs" style={{ fontWeight: "bold" }}>
                                {senderInitial}
                              </Text>
                            </Avatar>
                          )}


                          <Paper
                            p="md"
                            style={{
                              backgroundColor: isAgent
                                ? theme.colors.gray[1] // Agent messages (light gray)
                                : theme.colors.gray[0], // Admin messages (light blue)
                              border: `1px solid ${
                                isAgent ? theme.colors.gray[3] : theme.colors.gray[3]
                              }`,
                              borderRadius: theme.radius.md,
                              maxWidth: "70%",
                              padding: "12px",
                              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            }}
                          >
                            {/* Sender Name (Only for Agent) */}
                            {isAgent && (
                              <Text size="xs" weight="bold" color={theme.colors.blue[7]}>
                                {senderName}
                              </Text>
                            )}

                            {/* Message Content */}
                            <Text
                              size="sm"
                              style={{
                                fontFamily: "monospace",
                                whiteSpace: "pre-wrap",
                                lineHeight: 1.6,
                                color: theme.colors.gray[8],
                              }}
                            >
                              {msg.message}
                            </Text>

                            {/* Timestamp */}
                            <Text
                              size="xs"
                              color={theme.colors.gray[5]}
                              mt="xs"
                              style={{ textAlign: "right" }}
                            >
                              {msg.created_at}
                            </Text>
                          </Paper>
                        </Box>
                      );
                    })}
                  </Box>






                  {/* Response Section */}
                  <Box
                    style={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      padding: "16px",
                      borderTop: `1px solid ${theme.colors.gray[3]}`,
                      backgroundColor: theme.colors.gray[0],
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <TextInput
                      placeholder="Type your response..."
                      value={response}
                      onChange={handleResponseChange}
                      radius="md"
                      size="md"
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
                      fullWidth
                      styles={{
                        root: {
                          backgroundColor: theme.colors.blue[6],
                          color: theme.white,
                          "&:hover": {
                            backgroundColor: theme.colors.blue[7],
                          },
                        },
                      }}
                    >
                      Send
                    </Button>
                  </Box>
                </>
              ) : (
                <Text
                  size="lg"
                  color="dimmed"
                  align="center"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                  }}
                >
                  <img
                    src="/select-message.svg"
                    alt="No messages"
                    style={{ width: "300px" }}
                  />
                  Select a message to view and respond
                </Text>
              )}
            </Paper>
          </Grid.Col>
        ) : (
          <Modal
            opened={!!selectedMessages}
            onClose={() => setSelectedMessages(null)}
            title="Message"
            size="lg"
            padding="lg"
            overlayProps={{ blur: 1 }}
          >
            {selectedMessages && (
              <>
                {/* User Information Section */}
                <Box
                  style={{
                    padding: "16px",
                    borderBottom: `1px solid ${theme.colors.gray[3]}`,
                    backgroundColor: theme.colors.gray[0],
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

                {/* Messages Section */}
                <Box
                  style={{
                    padding: "16px",
                    overflowY: "auto",
                    maxHeight: "40vh",
                  }}
                >
                  {selectedMessages.map((msg) => {
                    const isAgent = msg.sender_agent !== null;
                    const senderName = isAgent ? msg.sender_agent.name : msg.sender_admin.name;
                    return (
                      <Box
                        key={msg.id}
                        style={{
                          display: "flex",
                          justifyContent: isAgent ? "flex-start" : "flex-end",
                          marginBottom: "16px",
                        }}
                      >
                        <Paper
                          p="md"
                          style={{
                            backgroundColor: isAgent ? theme.colors.gray[1] : theme.colors.gray[0],
                            border: `1px solid ${theme.colors.gray[3]}`,
                            borderRadius: theme.radius.md,
                            maxWidth: "80%",
                          }}
                        >
                          {isAgent && (
                            <Text size="xs" weight="bold" color={theme.colors.blue[7]}>
                              {senderName}
                            </Text>
                          )}
                          <Text
                            size="sm"
                            style={{
                              fontFamily: "monospace",
                              whiteSpace: "pre-wrap",
                              lineHeight: 1.6,
                              color: theme.colors.gray[8],
                            }}
                          >
                            {msg.message}
                          </Text>
                          <Text
                            size="xs"
                            color={theme.colors.gray[5]}
                            mt="xs"
                            style={{ textAlign: "right" }}
                          >
                            {msg.created_at}
                          </Text>
                        </Paper>
                      </Box>
                    );
                  })}
                </Box>

                {/* Response Section */}
                <Box
                  style={{
                    padding: "16px",
                    borderTop: `1px solid ${theme.colors.gray[3]}`,
                    backgroundColor: theme.colors.gray[0],
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <TextInput
                    placeholder="Type your response..."
                    value={response}
                    onChange={handleResponseChange}
                    radius="sm"
                    size="xs"
                    styles={{ input: { backgroundColor: theme.white, borderColor: theme.colors.gray[3] } }}
                  />
                  <Button
                    onClick={handleSendResponse}
                    size="xs"
                    radius="xs"
                    fullWidth
                    styles={{
                      root: {
                        backgroundColor: theme.colors.blue[6],
                        color: theme.white,
                        "&:hover": { backgroundColor: theme.colors.blue[7] },
                      },
                    }}
                  >
                    Send
                  </Button>
                </Box>
              </>
            )}
          </Modal>

        )}
      </Grid>
    </>
  );
}