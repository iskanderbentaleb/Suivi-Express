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
  const [selectedMessage, setSelectedMessage] = useState(null);
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

  const handleMessageSelect = (message) => {
    setSelectedMessage(message);
    setResponse("");
    setInboxMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.id === message.id ? { ...msg, read: true } : msg
      )
    );
  };

  const handleResponseChange = (event) => {
    setResponse(event.target.value);
  };

  const handleSendResponse = () => {
    alert(`Response sent: ${response}`);
    setResponse("");
  };

  const filteredMessages = inboxMessages.filter((message) => {
    if (filter === "read") return message.read;
    if (filter === "unread") return !message.read;
    return true; // 'all'
  });

  // Fetch messages from the API
  const fetchInboxMessages = async (page = 1, searchTerm = "") => {
    setLoading(true);
    try {
      const { data } = await messages.inbox(page, searchTerm);

      // Map the API response to your UI structure
      const mappedMessages = data.data.map((message) => ({
        id: message.id,
        sender: {
          firstName: message.sender_agent?.name || "Unknown",
          lastName: "",
        },
        subject: message.message,
        content: message.message, // Use the message as content
        timestamp: message.created_at,
        read: message.is_read === 1,
        status: message.status.name,
        order: {
          id: message.order.id,
          tracking: message.order.tracking,
          status: message.order.status.status,
        },
      }));

      setInboxMessages(mappedMessages); // Update the state with mapped messages
      setTotalPages(data.meta.last_page || 1); // Update total pages
    } catch (error) {
      notifications.show({ message: "Error fetching data: " + error, color: "red" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInboxMessages(currentPage, search);
  }, [currentPage, search]);

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
              <ScrollArea>
                {loading ? (
                  // Show skeleton while loading
                  Array.from({ length: 5 }).map((_, index) => <SkeletonMessage key={index} />)
                ) : (
                  // Show actual messages when data is loaded
                  filteredMessages
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .map((message) => (
                      <Paper
                        key={message.id}
                        p="md"
                        mb="sm"
                        onClick={() => handleMessageSelect(message)}
                        style={{
                          cursor: "pointer",
                          backgroundColor:
                            selectedMessage?.id === message.id ? theme.colors.gray[1] : theme.white,
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
                        {/* Sender and Unread Badge */}
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
                            {message.sender.firstName} {message.sender.lastName}
                          </Text>
                        </Group>

                        {/* Subject */}
                        <Text
                          size="sm"
                          color="dimmed"
                          weight={!message.read ? 600 : 400}
                          style={{ marginBottom: "4px" }}
                        >
                          {message.subject}
                        </Text>

                        {/* Timestamp */}
                        <Text size="xs" color="gray" style={{ marginBottom: "8px" }}>
                          {new Date(message.timestamp).toLocaleString()}
                        </Text>

                        {/* Status Badge */}
                        <Box style={{ display: "flex", justifyContent: "flex-end" }}>
                          <Badge
                            color={
                              message.status === "Succès"
                                ? "green"
                                : message.status === "En attente de réponse"
                                ? "orange"
                                : message.status === "Échec"
                                ? "red"
                                : "gray"
                            }
                            size="sm"
                            radius="lg"
                            style={{
                              border: `1px solid ${
                                message.status === "Succès"
                                  ? theme.colors.green[6]
                                  : message.status === "En attente de réponse"
                                  ? theme.colors.orange[6]
                                  : message.status === "Échec"
                                  ? theme.colors.red[6]
                                  : theme.colors.gray[6]
                              }`,
                              padding: "4px 12px",
                              boxShadow: theme.shadows.xs,
                              transition: "all 0.2s ease-in-out",
                              ":hover": {
                                transform: "scale(1.05)",
                              },
                            }}
                          >
                            {message.status}
                          </Badge>
                        </Box>
                      </Paper>
                    ))
                )}
              </ScrollArea>
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
              {selectedMessage ? (
                <>
                  {/* User Information Section */}
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
                      <Avatar radius="sm" color="blue">
                        {selectedMessage.sender.firstName.charAt(0).toUpperCase()}
                      </Avatar>
                      <div>
                        <Text size="sm" weight={500} color={theme.colors.gray[7]}>
                          {selectedMessage.sender.firstName} {selectedMessage.sender.lastName}
                        </Text>
                        <Text size="xs" color="dimmed">
                          {selectedMessage.sender.email}
                        </Text>
                        <Text size="xs">
                          Order Tracking:{" "}
                          <Code color="red.9" c="white">
                            {selectedMessage.order.tracking}
                          </Code>
                        </Text>
                      </div>
                    </Group>
                  </Box>

                  {/* Message Content Section */}
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
                    {/* Original Message */}
                    <Box
                      style={{
                        width: "80%",
                        display: "flex",
                        justifyContent: "flex-start",
                        marginBottom: "16px",
                      }}
                    >
                      <Paper
                        p="md"
                        style={{
                          backgroundColor: theme.colors.gray[1],
                          border: `1px solid ${theme.colors.gray[3]}`,
                          borderRadius: theme.radius.md,
                          maxWidth: "70%",
                        }}
                      >
                        <Text
                          size="sm"
                          style={{
                            fontFamily: "monospace",
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.6,
                            color: theme.colors.gray[8],
                          }}
                        >
                          {selectedMessage.content}
                        </Text>
                        <Text
                          size="xs"
                          color={theme.colors.gray[5]}
                          mt="xs"
                          style={{ textAlign: "right" }}
                        >
                          {new Date(selectedMessage.timestamp).toLocaleString()}
                        </Text>
                      </Paper>
                    </Box>

                    {/* Fake Responses */}
                    {[
                      {
                        id: 1,
                        sender: "John Doe",
                        content: "This is a response to the original message.",
                        timestamp: "2023-10-02T12:30:00",
                      },
                      {
                        id: 2,
                        sender: "Jane Smith",
                        content: "Another response with more details.",
                        timestamp: "2023-10-02T14:45:00",
                      },
                      {
                        id: 3,
                        sender: "Alice Johnson",
                        content: "A third response for testing purposes.",
                        timestamp: "2023-10-02T16:15:00",
                      },
                    ].map((response) => (
                      <Box
                        key={response.id}
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          marginBottom: "16px",
                        }}
                      >
                        <Paper
                          p="md"
                          style={{
                            backgroundColor: theme.colors.gray[3],
                            border: `1px solid ${theme.colors.gray[4]}`,
                            borderRadius: theme.radius.md,
                            maxWidth: "70%",
                          }}
                        >
                          <Text
                            size="sm"
                            style={{
                              fontFamily: "monospace",
                              whiteSpace: "pre-wrap",
                              lineHeight: 1.6,
                              color: theme.colors.gray[8],
                            }}
                          >
                            {response.content}
                          </Text>
                          <Text
                            size="xs"
                            color={theme.colors.gray[5]}
                            mt="xs"
                            style={{ textAlign: "right" }}
                          >
                            {new Date(response.timestamp).toLocaleString()}
                          </Text>
                        </Paper>
                      </Box>
                    ))}
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
            opened={!!selectedMessage}
            onClose={() => setSelectedMessage(null)}
            title="Message"
            size="lg"
            padding="lg"
            overlayProps={{
              blur: 1,
            }}
          >
            {selectedMessage && (
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
                    <Avatar radius="sm" color="blue">
                      {selectedMessage.sender.firstName.charAt(0).toUpperCase()}
                    </Avatar>
                    <div>
                      <Text size="sm" weight={500} color={theme.colors.gray[7]}>
                        {selectedMessage.sender.firstName} {selectedMessage.sender.lastName}
                      </Text>
                      <Text size="xs" color="dimmed">
                        {selectedMessage.sender.email}
                      </Text>
                      <Text size="xs">
                        Order Tracking:{" "}
                        <Code color="red.9" c="white">
                          {selectedMessage.order.tracking}
                        </Code>
                      </Text>
                    </div>
                  </Group>
                </Box>

                {/* Message Content Section */}
                <Box
                  style={{
                    padding: "16px",
                    overflowY: "auto",
                    maxHeight: "40vh",
                  }}
                >
                  {/* Original Message */}
                  <Box
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      marginBottom: "16px",
                    }}
                  >
                    <Paper
                      p="md"
                      style={{
                        backgroundColor: theme.colors.gray[1],
                        border: `1px solid ${theme.colors.gray[3]}`,
                        borderRadius: theme.radius.md,
                        maxWidth: "80%",
                      }}
                    >
                      <Text
                        size="xs"
                        style={{
                          fontFamily: "monospace",
                          whiteSpace: "pre-wrap",
                          lineHeight: 1.6,
                          color: theme.colors.gray[8],
                        }}
                      >
                        {selectedMessage.content}
                      </Text>
                      <Text
                        size="xs"
                        color={theme.colors.gray[5]}
                        mt="xs"
                        style={{ textAlign: "right" }}
                      >
                        {new Date(selectedMessage.timestamp).toLocaleString()}
                      </Text>
                    </Paper>
                  </Box>

                  {/* Fake Responses */}
                  {[
                    {
                      id: 1,
                      sender: "John Doe",
                      content: "This is a response to the original message.",
                      timestamp: "2023-10-02T12:30:00",
                    },
                    {
                      id: 2,
                      sender: "Jane Smith",
                      content: "Another response with more details.",
                      timestamp: "2023-10-02T14:45:00",
                    },
                    {
                      id: 3,
                      sender: "Alice Johnson",
                      content: "A third response for testing purposes.",
                      timestamp: "2023-10-02T16:15:00",
                    },
                  ].map((response) => (
                    <Box
                      key={response.id}
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        marginBottom: "16px",
                      }}
                    >
                      <Paper
                        p="md"
                        style={{
                          backgroundColor: theme.colors.gray[3],
                          border: `1px solid ${theme.colors.gray[4]}`,
                          borderRadius: theme.radius.md,
                          maxWidth: "80%",
                        }}
                      >
                        <Text
                          size="xs"
                          style={{
                            fontFamily: "monospace",
                            whiteSpace: "pre-wrap",
                            lineHeight: 1.6,
                            color: theme.colors.gray[8],
                          }}
                        >
                          {response.content}
                        </Text>
                        <Text
                          size="xs"
                          color={theme.colors.gray[5]}
                          mt="xs"
                          style={{ textAlign: "right" }}
                        >
                          {new Date(response.timestamp).toLocaleString()}
                        </Text>
                      </Paper>
                    </Box>
                  ))}
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
                    radius="md"
                    size="xs"
                    styles={{
                      input: {
                        backgroundColor: theme.white,
                        borderColor: theme.colors.gray[3],
                      },
                    }}
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
            )}
          </Modal>
        )}
      </Grid>
    </>
  );
}