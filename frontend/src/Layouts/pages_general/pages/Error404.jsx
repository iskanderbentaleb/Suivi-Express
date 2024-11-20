import { Container, Title, Text, Button, Group } from '@mantine/core';
import { Illustration } from '../../../assets/Illustration';
import classes from '../styles/NothingFoundBackground.module.css';
import { Link } from 'react-router-dom';


export default function NothingFoundBackground() {

  return (
    <Container className={classes.root}>
      <div className={classes.inner}>
        <Illustration className={classes.image} />
        <div className={classes.content}>
          <Title className={classes.title}>Nothing to see here</Title>
          <Text c="dimmed" size="lg" ta="center" className={classes.title} mt={10} mb={10}>
          Page you are trying to open does not exist. You may have mistyped the address, or the
          page has been moved to another URL. If you think this is an error contact support.
          </Text>
          <Group justify="center">
              <Link to={'/'}>
                  <Button variant="light" size="md">Take me back to home page</Button>
              </Link>
          </Group>
        </div>
      </div>
    </Container>
  );
}
