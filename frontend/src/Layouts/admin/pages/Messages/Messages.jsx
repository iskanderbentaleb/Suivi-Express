import { ActionIcon, Badge, Button, Flex, Grid, Group, Paper, rem, ScrollArea, SimpleGrid, Text, TextInput, useMantineTheme } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconArrowRight, IconBrandTelegram, IconDownload, IconMessageCircleDown, IconMessageCirclePlus, IconSearch } from "@tabler/icons-react";
import { useState } from "react";


  const styleCard = {
    background: 'white',
    borderRadius: rem(8),
    padding: rem(10),
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  };




export default function Messages() {

    const [selectedButton, setSelectedButton] = useState(null);
    const [search, setSearch] = useState('');


    const formSearch = useForm({
        initialValues: { search: '' },
    });

    
    // handle Switch Button sent and inbox 
    const handleSwitchButtonSentInboxClick = (buttonName) => {
    setSelectedButton(buttonName);
    };    


    // --------------- search agents --------------------
    const handleSearch = (values) => {
        const trimmedSearch = values.search.trim().toLowerCase();
        if (trimmedSearch !== search) {
        setSearch(trimmedSearch);
        setActivePage(1);
        }
    };
    // --------------- search agents --------------------






    const [selectedMessage, setSelectedMessage] = useState(null);
    const [response, setResponse] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'read', 'unread'
    const [messages, setMessages] = useState([
      {
        id: 1,
        sender: { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
        subject: 'Hello',
        content: 'This is the first message.',
        timestamp: '2023-10-01T10:30:00',
        read: false,
      },
      {
        id: 2,
        sender: { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com' },
        subject: 'Meeting Reminder',
        content: "Don't forget the meeting at 3 PM.",
        timestamp: '2023-10-02T14:15:00',
        read: true,
      },
      {
        id: 3,
        sender: { firstName: 'Alice', lastName: 'Johnson', email: 'alice.johnson@example.com' },
        subject: 'Project Update',
        content: 'The project is on track for delivery.',
        timestamp: '2023-10-03T09:45:00',
        read: false,
      },
    ]);
  
    const handleMessageSelect = (message) => {
      setSelectedMessage(message);
      setResponse('');
      setMessages((prevMessages) =>
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
      setResponse('');
    };
  
    const filteredMessages = messages.filter((message) => {
      if (filter === 'read') return message.read;
      if (filter === 'unread') return !message.read;
      return true; // 'all'
    });
  
    const theme = useMantineTheme();
  

      
    return(
        <>
            <Text fw={700} fz="xl" mb="md">
                Messages 
              </Text>
            <SimpleGrid cols={{ base: 1, sm: 1 }} spacing="lg">
                {/* Actions Section */}
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                  
                    {/* buttons Section */}    
                    <Paper style={styleCard}>

                        <Flex gap="sm" align="center">

                            <Button fullWidth variant="filled" color="blue" >
                                <IconMessageCirclePlus stroke={2} />
                            </Button>


                            <Button rightSection={<IconMessageCircleDown size={14} />} onClick={() => handleSwitchButtonSentInboxClick('inbox')} fullWidth variant={selectedButton === 'inbox' ? 'outline' : 'light'}>
                                Inbox
                            </Button>

                            <Button rightSection={<IconBrandTelegram size={14} />} onClick={() => handleSwitchButtonSentInboxClick('sent')} color="green" fullWidth variant={selectedButton === 'sent' ? 'outline' : 'light'}>
                                Sent
                            </Button>

                           
                        </Flex>
                    </Paper>



                    {/* Search Section */}          
                    <Paper style={styleCard}>
                        <form style={{ width: '100%' }} onSubmit={formSearch.onSubmit(handleSearch)}>
                        <TextInput
                            size="sm"
                            radius="md"
                            placeholder="Search for messages..."
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
            </SimpleGrid>







        <Grid style={{ marginTop:'20px' }}>
            {/* Left Side: Message List */}
            <Grid.Col
                span={{ base: 12, md: 4 }}
                style={{
                height: { base: '50vh', md: '75vh' },
                overflow: 'hidden',
                background:'#ffffff00'
                }}
            >
                <Paper
                p="lg"
                shadow="sm"
                style={{
                    height: '100%',
                    backgroundColor: '#ffffff',
                }}
                >
                <Text size="xl" mb="lg" weight={700}>
                    Inbox
                </Text>
                <Group mb="lg" spacing="sm" noWrap>
                    <Button
                    variant={filter === 'all' ? 'filled' : 'outline'}
                    onClick={() => setFilter('all')}
                    size="sm"
                    >
                    All
                    </Button>
                    <Button
                    variant={filter === 'read' ? 'filled' : 'outline'}
                    onClick={() => setFilter('read')}
                    size="sm"
                    >
                    Read
                    </Button>
                    <Button
                    variant={filter === 'unread' ? 'filled' : 'outline'}
                    onClick={() => setFilter('unread')}
                    size="sm"
                    >
                    Unread
                    </Button>
                </Group>
                <ScrollArea style={{ height: 'calc(100vh - 400px)' }}>
                    {filteredMessages
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                    .map((message) => (
                        <Paper
                        key={message.id}
                        p="md"
                        mb="sm"
                        onClick={() => handleMessageSelect(message)}
                        style={{
                            cursor: 'pointer',
                            backgroundColor: selectedMessage?.id === message.id ? theme.colors.gray[1] : theme.white ,
                            border: `1px solid ${theme.colors.gray[3]}`,
                            borderRadius: theme.radius.sm,
                            transition: 'background-color 0.2s',
                        }}
                        >
                        <Group align="center" spacing="sm">
                            {!message.read && <Badge color="blue" size="sm">Unread</Badge>}
                            <Text weight={!message.read ? 700 : 500} size="sm">
                            {message.sender.firstName} {message.sender.lastName}
                            </Text>
                        </Group>
                        <Text size="sm" color="dimmed" weight={!message.read ? 600 : 400} mt={4}>
                            {message.subject}
                        </Text>
                        <Text size="xs" color="gray" mt={4}>
                            {new Date(message.timestamp).toLocaleString()}
                        </Text>
                        </Paper>
                    ))}
                </ScrollArea>
                </Paper>
            </Grid.Col>

            {/* Right Side: Selected Message and Response */}
            <Grid.Col
                span={{ base: 12, md: 8 }}
                style={{
                height: { base: '50vh', md: '75vh' },
                overflow: 'hidden',
                }}
            >
                <Paper
                p="lg"
                shadow="sm"
                style={{
                    height: '100%',
                    backgroundColor: theme.white,
                }}
                >
                {selectedMessage ? (
                    <>
                    <Text size="xl" mb="md" weight={700}>
                        {selectedMessage.subject}
                    </Text>
                    <Text size="sm" color="dimmed" mb="md">
                        From: {selectedMessage.sender.firstName} {selectedMessage.sender.lastName} ({selectedMessage.sender.email})
                    </Text>
                    <Text mb="md" style={{ lineHeight: 1.6 }}>
                        {selectedMessage.content}
                    </Text>
                    <Text size="xs" color="gray" mb="md">
                        Sent: {new Date(selectedMessage.timestamp).toLocaleString()}
                    </Text>
                    <TextInput
                        placeholder="Type your response..."
                        value={response}
                        onChange={handleResponseChange}
                        mb="md"
                        style={{ borderRadius: theme.radius.sm }}
                    />
                    <Button
                        onClick={handleSendResponse}
                        style={{
                        backgroundColor: theme.colors.blue[6],
                        color: theme.white,
                        }}
                    >
                        Send Response
                    </Button>
                    </>
                ) : (
                    <Text
                    size="lg"
                    color="dimmed"
                    align="center"
                    style={{
                        display: 'flex',
                        justifyContent: 'center', // Center horizontally
                        alignItems: 'center', // Center vertically
                        height: '100%', // Take up full height of the container
                    }}
                    >
                    Select a message to view and respond
                    </Text>
                )}
                </Paper>
            </Grid.Col>
        </Grid>
        </>
    )
}