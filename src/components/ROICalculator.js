import React, { useState } from 'react';
import {
  Box,
  Container,
  Flex,
  Stack,
  Text,
  Heading,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  VStack,
  HStack,
  Divider,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Grid,
  GridItem,
  useColorModeValue,
  Switch,
  RadioGroup,
  Radio,
  Progress,
  useDisclosure,
  createIcon,
  Icon
} from '@chakra-ui/react';
import {
  CheckCircleIcon,
  InfoIcon,
  ChevronDownIcon,
  DownloadIcon
} from '@chakra-ui/icons';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, ChartTooltip, Legend);

// Create custom icons
const CalculatorIcon = createIcon({
  displayName: 'CalculatorIcon',
  viewBox: '0 0 24 24',
  path: (
    <path 
      fill="currentColor" 
      d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v4h16V4H4zm0 6v10h16V10H4zm2 2h5v2H6v-2zm7 0h3v2h-3v-2zm-7 4h5v2H6v-2zm7 0h3v4h-3v-4z"
    />
  ),
});

const UserCheckIcon = createIcon({
  displayName: 'UserCheckIcon',
  viewBox: '0 0 24 24',
  path: (
    <path 
      fill="currentColor" 
      d="M9 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM6.5 6a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0zM3.394 12.243A17.955 17.955 0 0 0 2 19.8V22h8.1c.12 0 .239-.004.356-.011A3.995 3.995 0 0 1 10 20h-6a16 16 0 0 1 9-9 3.989 3.989 0 0 1-.76-1.55 17.93 17.93 0 0 0-8.846 2.793zM16 14v2h6v2h-6v2h-2v-2h-6v-2h6v-2h2zM10 4h2v2h4v2h-4v2h-2V8H6V6h4V4z"
    />
  ),
});

const UsersIcon = createIcon({
  displayName: 'UsersIcon',
  viewBox: '0 0 24 24',
  path: (
    <path 
      fill="currentColor" 
      d="M12 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-6a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM18 15c-.5-2-3-3-6-3s-5.5 1-6 3v1h12v-1zm2 1H4v-1C4 11.34 7.33 9 12 9s8 2.34 8 6v1z"
    />
  ),
});

const EuroIcon = createIcon({
  displayName: 'EuroIcon',
  viewBox: '0 0 24 24',
  path: (
    <path 
      fill="currentColor" 
      d="M15 18.5a9.5 9.5 0 0 1-7.34-3.5H4v-2h3.1a9.8 9.8 0 0 1 0-3H4V8h3.66A9.5 9.5 0 0 1 15 4.5c1.95 0 3.78.5 5.37 1.5l-1.17 2.3A7.45 7.45 0 0 0 15 7a7.55 7.55 0 0 0-5.97 3H14v2H8.56a8.2 8.2 0 0 0-.06 1 8.8 8.8 0 0 0 .06 1H14v2H9.03c1.4 1.9 3.5 3 5.97 3 1.55 0 3-.39 4.2-1.08l1.17 2.3A10.15 10.15 0 0 1 15 18.5z"
    />
  ),
});

const PieChartIcon = createIcon({
  displayName: 'PieChartIcon',
  viewBox: '0 0 24 24',
  path: (
    <path 
      fill="currentColor" 
      d="M11 2v20c-5.05-.5-9-4.76-9-10 0-5.24 3.95-9.5 9-10zm2 0v9h9c-.5-5.05-4.76-9-10-9zm0 11v9c5.24 0 9.5-3.95 10-9h-10z"
    />
  ),
});

const ClockIcon = createIcon({
  displayName: 'ClockIcon',
  viewBox: '0 0 24 24',
  path: (
    <path 
      fill="currentColor" 
      d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm0-18a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm0 8H8v2h6V8h-2z"
    />
  ),
});

const DollarIcon = createIcon({
  displayName: 'DollarIcon',
  viewBox: '0 0 24 24',
  path: (
    <path 
      fill="currentColor" 
      d="M12 1v2c-4.97 0-9 4.03-9 9 0 4.97 4.03 9 9 9 4.97 0 9-4.03 9-9h-2c0 3.87-3.13 7-7 7s-7-3.13-7-7 3.13-7 7-7V1zm1 9V6.5c1.4.5 2.5 1.6 3 3H13zm-2 0H8c.5-1.4 1.6-2.5 3-3V10zm12-1h-2c0-2.76-2.24-5-5-5v2c1.66 0 3 1.34 3 3z"
    />
  ),
});

const FileDownIcon = createIcon({
  displayName: 'FileDownIcon',
  viewBox: '0 0 24 24',
  path: (
    <path 
      fill="currentColor" 
      d="M20 18H4V8H20V18ZM20 6H12L10 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6ZM12 17L16 13H13V9H11V13H8L12 17Z"
    />
  ),
});

const SettingsIcon = createIcon({
  displayName: 'SettingsIcon',
  viewBox: '0 0 24 24',
  path: (
    <path 
      fill="currentColor" 
      d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
    />
  ),
});

// Fee constants
const STATUTORY_FEE = 10.53;
const PRIVATE_FEE_MULTIPLIER = 1.8;
const PRIVATE_FEE = STATUTORY_FEE * PRIVATE_FEE_MULTIPLIER;
const SELF_PAY_PACKAGES = {
  einzelsitzung: { name: "Einzelsitzung", price: 59.9, sessions: 1 },
  tenPackage: { name: "10er Karte", price: 450, sessions: 10 },
  twentyPackage: { name: "20er Karte", price: 740, sessions: 20 },
  thirtyPackage: { name: "30er Karte", price: 990, sessions: 30 },
  fortyPackage: { name: "40er Karte", price: 1120, sessions: 40 },
};

// Average reLounge system cost for ROI calculation
const AVERAGE_SYSTEM_COST = 15000;

function ROICalculator() {
  // Patient counts
  const [statutoryPatients, setStatutoryPatients] = useState(20);
  const [privatePatients, setPrivatePatients] = useState(5);
  const [selfPayPatients, setSelfPayPatients] = useState(10);

  // Sessions per patient
  const [statutorySessions, setStatutorySessions] = useState(6);
  const [privateSessions, setPrivateSessions] = useState(6);

  // Self-pay package selection
  const [selectedPackage, setSelectedPackage] = useState("twentyPackage");

  // Advanced options
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [systemCost, setSystemCost] = useState(AVERAGE_SYSTEM_COST);
  const [monthlyExpenses, setMonthlyExpenses] = useState(500);

  // Results
  const [statutoryRevenue, setStatutoryRevenue] = useState(0);
  const [privateRevenue, setPrivateRevenue] = useState(0);
  const [selfPayRevenue, setSelfPayRevenue] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [breakEvenMonths, setBreakEvenMonths] = useState(0);

  // Show results section
  const { isOpen: showResults, onOpen: onShowResults } = useDisclosure();

  // Theme colors
  const primaryColor = useColorModeValue("gold.500", "gold.400");
  const secondaryColor = useColorModeValue("blue.700", "blue.600");
  const cardBgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.700", "gray.200");
  const textLightColor = useColorModeValue("gray.500", "gray.400");

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
  };

  // Calculate revenues
  const calculateResults = () => {
    // Calculate revenue for statutory patients
    const statRevenue = statutoryPatients * statutorySessions * STATUTORY_FEE;
    setStatutoryRevenue(statRevenue);

    // Calculate revenue for private patients
    const privRevenue = privatePatients * privateSessions * PRIVATE_FEE;
    setPrivateRevenue(privRevenue);

    // Calculate revenue for self-pay patients
    const selectedPkg = SELF_PAY_PACKAGES[selectedPackage];
    const selfRevenue = selfPayPatients * selectedPkg.price;
    setSelfPayRevenue(selfRevenue);

    // Calculate total revenue
    const total = statRevenue + privRevenue + selfRevenue;
    setTotalRevenue(total);

    // Calculate break-even period (in months)
    const monthlyRevenue = total - monthlyExpenses;
    const breakEven = monthlyRevenue > 0 ? Math.ceil(systemCost / monthlyRevenue) : 0;
    setBreakEvenMonths(breakEven);

    // Show results
    onShowResults();

    // Improved scrolling - wait for state update to complete and DOM to render
    setTimeout(() => {
      const resultsSection = document.getElementById("results-section");
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 300);
  };

  // Chart data for revenue breakdown
  const revenueChartData = {
    labels: ["Gesetzlich", "Privat", "Selbstzahler"],
    datasets: [
      {
        label: "Umsatz (€)",
        data: [statutoryRevenue, privateRevenue, selfPayRevenue],
        backgroundColor: [
          "rgba(49, 130, 206, 0.7)",  // Blue
          "rgba(49, 130, 206, 0.4)",  // Light blue
          "rgba(236, 201, 75, 0.7)"   // Gold
        ],
        borderColor: [
          "rgba(49, 130, 206, 1)",    // Blue
          "rgba(49, 130, 206, 0.8)",  // Light blue
          "rgba(236, 201, 75, 1)"     // Gold
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif'
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        text: "Umsatzverteilung",
        font: {
          size: 16,
          weight: 600,
          family: 'Inter, system-ui, sans-serif'
        },
        color: '#2C5282',
        padding: {
          bottom: 15
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.label || '';
            if (label) {
              label += ': ';
            }
            label += formatCurrency(context.raw);
            return label;
          }
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1000
    }
  };

  // Get breakeven color based on months
  const getBreakevenColor = (months) => {
    if (months <= 8) return "green";
    if (months <= 14) return "orange";
    return "red";
  };

  // Get breakeven message
  const getBreakevenMessage = (months) => {
    if (months <= 8) {
      return "Ihre geschätzte Amortisationszeit ist hervorragend! Mit " + months + " Monaten werden Sie schneller als der typische Zeitraum von 8-14 Monaten einen Return on Investment sehen.";
    } else if (months <= 14) {
      return "Ihre geschätzte Amortisationszeit von " + months + " Monaten liegt im typischen Bereich von 8-14 Monaten für reLounge-Systeme.";
    } else {
      return "Ihre geschätzte Amortisationszeit von " + months + " Monaten ist länger als der typische Bereich von 8-14 Monaten. Erwägen Sie eine Anpassung Ihres Patientenmix oder der Paketangebote, um den ROI zu verbessern.";
    }
  };

  return (
    <Container maxW="container.lg" py={8}>
      <Card 
        overflow="hidden" 
        variant="outline" 
        borderColor={borderColor}
        bg={cardBgColor} 
        boxShadow="lg"
        mb={8}
        borderRadius="xl"
      >
        <CardHeader 
          bg={cardBgColor} 
          borderBottomWidth="1px" 
          borderColor={borderColor}
          position="relative"
          pb={4}
          _after={{
            content: '""',
            position: 'absolute',
            left: 0,
            top: 0,
            width: '4px',
            height: '100%',
            bg: 'gold.400'
          }}
        >
          <Stack spacing={1} pl={2}>
            <Heading as="h2" size="md" color={secondaryColor}>
              <Flex alignItems="center" gap={2}>
                <Icon as={UsersIcon} />
                Patienteninformationen
              </Flex>
            </Heading>
            <Text color={textLightColor} fontSize="sm">
              Geben Sie die Patientendaten Ihrer Praxis ein, um den potenziellen Umsatz zu berechnen
            </Text>
          </Stack>
        </CardHeader>

        <CardBody pt={6}>
          <VStack spacing={8} align="stretch">
            {/* Statutory Health Insurance Patients */}
            <Box>
              <Heading as="h3" size="sm" mb={4} color={secondaryColor} position="relative" pb={2} display="flex" alignItems="center">
                <Icon as={UserCheckIcon} mr={2} />
                Gesetzlich versicherte Patienten
                <Box as="span" position="absolute" bottom="0" left="0" width="40px" height="2px" bg="gold.400" />
              </Heading>
              
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                <GridItem>
                  <FormControl>
                    <FormLabel fontWeight="medium" fontSize="sm" color={secondaryColor}>
                      Anzahl der Patienten
                    </FormLabel>
                    <NumberInput 
                      min={0} 
                      value={statutoryPatients} 
                      onChange={(_, val) => setStatutoryPatients(val || 0)}
                      bg="white"
                      borderRadius="md"
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Text fontSize="xs" color={textLightColor} mt={1}>
                      Gebühr pro Sitzung: {formatCurrency(STATUTORY_FEE)}
                    </Text>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel fontWeight="medium" fontSize="sm" color={secondaryColor}>
                      Durchschnittliche Sitzungen pro Patient
                    </FormLabel>
                    <NumberInput 
                      min={1} 
                      value={statutorySessions} 
                      onChange={(_, val) => setStatutorySessions(val || 1)}
                      bg="white"
                      borderRadius="md"
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </GridItem>
              </Grid>
            </Box>

            {/* Private Patients */}
            <Box>
              <Heading as="h3" size="sm" mb={4} color={secondaryColor} position="relative" pb={2} display="flex" alignItems="center">
                <Icon as={UserCheckIcon} mr={2} />
                Privatpatienten
                <Box as="span" position="absolute" bottom="0" left="0" width="40px" height="2px" bg="gold.400" />
              </Heading>
              
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                <GridItem>
                  <FormControl>
                    <FormLabel fontWeight="medium" fontSize="sm" color={secondaryColor}>
                      Anzahl der Patienten
                    </FormLabel>
                    <NumberInput 
                      min={0} 
                      value={privatePatients} 
                      onChange={(_, val) => setPrivatePatients(val || 0)}
                      bg="white"
                      borderRadius="md"
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Text fontSize="xs" color={textLightColor} mt={1}>
                      Gebühr pro Sitzung: {formatCurrency(PRIVATE_FEE)}
                    </Text>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel fontWeight="medium" fontSize="sm" color={secondaryColor}>
                      Durchschnittliche Sitzungen pro Patient
                    </FormLabel>
                    <NumberInput 
                      min={1} 
                      value={privateSessions} 
                      onChange={(_, val) => setPrivateSessions(val || 1)}
                      bg="white"
                      borderRadius="md"
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </GridItem>
              </Grid>
            </Box>

            {/* Self-Pay Patients */}
            <Box>
              <Heading as="h3" size="sm" mb={4} color={secondaryColor} position="relative" pb={2} display="flex" alignItems="center">
                <Icon as={EuroIcon} mr={2} />
                Selbstzahler
                <Box as="span" position="absolute" bottom="0" left="0" width="40px" height="2px" bg="gold.400" />
              </Heading>
              
              <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                <GridItem>
                  <FormControl>
                    <FormLabel fontWeight="medium" fontSize="sm" color={secondaryColor}>
                      Anzahl der Patienten
                    </FormLabel>
                    <NumberInput 
                      min={0} 
                      value={selfPayPatients} 
                      onChange={(_, val) => setSelfPayPatients(val || 0)}
                      bg="white"
                      borderRadius="md"
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel fontWeight="medium" fontSize="sm" color={secondaryColor}>
                      Paketauswahl
                    </FormLabel>
                    <RadioGroup value={selectedPackage} onChange={setSelectedPackage}>
                      <VStack align="stretch" spacing={2}>
                        {Object.entries(SELF_PAY_PACKAGES).map(([key, pkg]) => (
                          <Card 
                            key={key} 
                            borderWidth="1px" 
                            borderColor={selectedPackage === key ? "gold.400" : "gray.200"}
                            bg={selectedPackage === key ? "gold.50" : "white"}
                            boxShadow={selectedPackage === key ? "md" : "none"}
                            borderRadius="md"
                            transition="all 0.2s"
                            _hover={{ 
                              borderColor: "gold.400",
                              transform: "translateY(-2px)",
                              boxShadow: "sm"
                            }}
                          >
                            <CardBody py={2} px={3}>
                              <Radio value={key} colorScheme="yellow">
                                <Flex direction="column">
                                  <Text fontWeight="medium">{pkg.name} - {formatCurrency(pkg.price)}</Text>
                                  <Text fontSize="xs" color={textLightColor}>
                                    ({formatCurrency(pkg.price / pkg.sessions)} pro Sitzung)
                                  </Text>
                                </Flex>
                              </Radio>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    </RadioGroup>
                  </FormControl>
                </GridItem>
              </Grid>
            </Box>

            {/* Advanced Options */}
            <Card
              bg="gray.50"
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
              overflow="hidden"
            >
              <CardBody p={5}>
                <Flex justifyContent="space-between" alignItems="center" mb={showAdvancedOptions ? 4 : 0}>
                  <HStack>
                    <Icon as={SettingsIcon} color="gold.500" />
                    <Text fontWeight="medium" color={secondaryColor}>Erweiterte Optionen</Text>
                  </HStack>
                  <Switch 
                    colorScheme="yellow" 
                    isChecked={showAdvancedOptions} 
                    onChange={(e) => setShowAdvancedOptions(e.target.checked)}
                  />
                </Flex>

                {showAdvancedOptions && (
                  <Box
                    opacity={showAdvancedOptions ? 1 : 0}
                    transform={showAdvancedOptions ? "scale(1)" : "scale(0.9)"}
                    transition="all 0.3s ease"
                  >
                    <VStack align="stretch" spacing={4} mt={4} pt={4} borderTopWidth="1px" borderColor="gray.200">
                      <FormControl>
                        <FormLabel fontWeight="medium" fontSize="sm" color={secondaryColor}>
                          reLounge Systemkosten (€)
                        </FormLabel>
                        <NumberInput 
                          min={0} 
                          value={systemCost} 
                          onChange={(_, val) => setSystemCost(val || 0)}
                          bg="white"
                          borderRadius="md"
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </FormControl>

                      <FormControl>
                        <FormLabel fontWeight="medium" fontSize="sm" color={secondaryColor}>
                          Monatliche Betriebskosten (€)
                        </FormLabel>
                        <NumberInput 
                          min={0} 
                          value={monthlyExpenses} 
                          onChange={(_, val) => setMonthlyExpenses(val || 0)}
                          bg="white"
                          borderRadius="md"
                        >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                        <Text fontSize="xs" color={textLightColor} mt={1}>
                          Inklusive Strom, Wartung, etc.
                        </Text>
                      </FormControl>
                    </VStack>
                  </Box>
                )}
              </CardBody>
            </Card>

            {/* Calculate Button */}
            <Flex justifyContent="center" mt={4}>
              <Button
                onClick={calculateResults}
                colorScheme="yellow"
                size="lg"
                borderRadius="full"
                px={8}
                py={6}
                fontWeight="bold"
                boxShadow="lg"
                _hover={{ 
                  transform: "translateY(-2px)",
                  boxShadow: "xl"
                }}
                leftIcon={<Icon as={CalculatorIcon} />}
              >
                Ergebnisse berechnen
              </Button>
            </Flex>
          </VStack>
        </CardBody>
      </Card>

      {/* Results Section */}
      <Box
        id="results-section"
        mt={12}
        opacity={showResults ? 1 : 0}
        height={showResults ? "auto" : "0"}
        transform={showResults ? "translateY(0)" : "translateY(20px)"}
        transition="all 0.5s ease"
        overflow={showResults ? "visible" : "hidden"}
      >
        {showResults && (
          <>
            <Flex justifyContent="center" mb={6}>
              <Badge
                borderRadius="full"
                px={6}
                py={2}
                colorScheme="blue"
                fontSize="md"
                fontWeight="medium"
                display="flex"
                alignItems="center"
              >
                <ChevronDownIcon mr={1} /> Ihre Ergebnisse
              </Badge>
            </Flex>

            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} mb={6}>
              <GridItem>
                <Card 
                  overflow="hidden" 
                  variant="outline" 
                  borderColor={borderColor}
                  bg={cardBgColor} 
                  boxShadow="lg"
                  borderRadius="xl"
                  height="100%"
                >
                  <CardHeader 
                    bg={cardBgColor} 
                    borderBottomWidth="1px" 
                    borderColor={borderColor}
                    position="relative"
                    pb={4}
                    _after={{
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: '4px',
                      height: '100%',
                      bg: 'gold.400'
                    }}
                  >
                    <Stack spacing={1} pl={2}>
                      <Heading as="h2" size="md" color={secondaryColor} display="flex" alignItems="center">
                        <Icon as={DollarIcon} mr={2} />
                        Umsatzübersicht
                      </Heading>
                      <Text color={textLightColor} fontSize="sm">
                        Geschätzter Umsatz basierend auf Ihren Eingaben
                      </Text>
                    </Stack>
                  </CardHeader>

                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Box>
                        <Text color={textLightColor} fontSize="sm">Umsatz gesetzlich Versicherte</Text>
                        <Text color="blue.600" fontSize="lg" fontWeight="bold">{formatCurrency(statutoryRevenue)}</Text>
                      </Box>
                      <Divider />
                      
                      <Box>
                        <Text color={textLightColor} fontSize="sm">Umsatz Privatpatienten</Text>
                        <Text color="blue.600" fontSize="lg" fontWeight="bold">{formatCurrency(privateRevenue)}</Text>
                      </Box>
                      <Divider />
                      
                      <Box>
                        <Text color={textLightColor} fontSize="sm">Umsatz Selbstzahler</Text>
                        <Text color="blue.600" fontSize="lg" fontWeight="bold">{formatCurrency(selfPayRevenue)}</Text>
                      </Box>
                      <Divider />
                      
                      <Box>
                        <Text fontSize="lg" fontWeight="bold">Gesamtumsatz</Text>
                        <Text fontSize="2xl" color="gold.500" fontWeight="bold">
                          {formatCurrency(totalRevenue)}
                        </Text>
                      </Box>
                      
                      {showAdvancedOptions && (
                        <>
                          <Divider borderWidth="2px" />
                          <Heading as="h3" size="sm" color={secondaryColor} mb={2}>
                            Return on Investment
                          </Heading>
                          
                          <HStack justify="space-between">
                            <Text>Systemkosten:</Text>
                            <Text fontWeight="medium">{formatCurrency(systemCost)}</Text>
                          </HStack>
                          
                          <HStack justify="space-between">
                            <Text>Monatliche Betriebskosten:</Text>
                            <Text fontWeight="medium">{formatCurrency(monthlyExpenses)}</Text>
                          </HStack>
                          
                          <HStack justify="space-between">
                            <Text>Monatlicher Nettoertrag:</Text>
                            <Text fontWeight="bold" color="blue.600">
                              {formatCurrency(totalRevenue - monthlyExpenses)}
                            </Text>
                          </HStack>
                          
                          <HStack justify="space-between">
                            <Text>Geschätzte Amortisationszeit:</Text>
                            <Text fontWeight="bold" color="blue.600">
                              {breakEvenMonths > 0 ? `${breakEvenMonths} Monate` : "N/A"}
                            </Text>
                          </HStack>
                        </>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </GridItem>

              <GridItem>
                <Card 
                  overflow="hidden" 
                  variant="outline" 
                  borderColor={borderColor}
                  bg={cardBgColor} 
                  boxShadow="lg"
                  borderRadius="xl"
                  height="100%"
                >
                  <CardHeader 
                    bg={cardBgColor} 
                    borderBottomWidth="1px" 
                    borderColor={borderColor}
                    position="relative"
                    pb={4}
                    _after={{
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: '4px',
                      height: '100%',
                      bg: 'gold.400'
                    }}
                  >
                    <Stack spacing={1} pl={2}>
                      <Heading as="h2" size="md" color={secondaryColor} display="flex" alignItems="center">
                        <Icon as={PieChartIcon} mr={2} />
                        Umsatzvisualisierung
                      </Heading>
                      <Text color={textLightColor} fontSize="sm">
                        Grafische Darstellung Ihrer Umsatzströme
                      </Text>
                    </Stack>
                  </CardHeader>

                  <CardBody>
                    <Box height="300px" display="flex" justifyContent="center" alignItems="center" p={2}>
                      {totalRevenue > 0 ? (
                        <Pie data={revenueChartData} options={chartOptions} />
                      ) : (
                        <Box 
                          textAlign="center" 
                          bg="gray.50" 
                          p={6} 
                          borderRadius="md" 
                          color={textLightColor}
                          fontStyle="italic"
                          width="100%"
                        >
                          Geben Sie Patientendaten ein, um die Umsatzvisualisierung zu sehen
                        </Box>
                      )}
                    </Box>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>

            {showAdvancedOptions && breakEvenMonths > 0 && (
              <Card 
                overflow="hidden" 
                variant="outline" 
                borderColor={borderColor}
                bg={cardBgColor} 
                boxShadow="lg"
                borderRadius="xl"
                mb={6}
              >
                <CardHeader 
                  bg={cardBgColor} 
                  borderBottomWidth="1px" 
                  borderColor={borderColor}
                  position="relative"
                  pb={4}
                  _after={{
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '4px',
                    height: '100%',
                    bg: 'gold.400'
                  }}
                >
                  <Stack spacing={1} pl={2}>
                    <Heading as="h2" size="md" color={secondaryColor} display="flex" alignItems="center">
                      <Icon as={ClockIcon} mr={2} />
                      Amortisationsanalyse
                    </Heading>
                    <Text color={textLightColor} fontSize="sm">
                      Visualisierung Ihres Return on Investment im Zeitverlauf
                    </Text>
                  </Stack>
                </CardHeader>

                <CardBody p={6}>
                  <VStack spacing={5} align="stretch">
                    <Flex justifyContent="space-between" alignItems="center">
                      <Badge 
                        colorScheme={getBreakevenColor(breakEvenMonths)} 
                        p={2} 
                        fontSize="sm" 
                        borderRadius="md"
                      >
                        {Math.min(100, Math.round((breakEvenMonths / 24) * 100))}% bis zur Amortisation
                      </Badge>
                      <Text fontWeight="bold">{breakEvenMonths} Monate</Text>
                    </Flex>
                    
                    <Box>
                      <Progress 
                        value={Math.min(100, (breakEvenMonths / 24) * 100)} 
                        colorScheme={getBreakevenColor(breakEvenMonths)}
                        size="sm"
                        borderRadius="full"
                        mb={2}
                      />
                      <Flex justifyContent="space-between" fontSize="xs" color={textLightColor}>
                        <Text>0</Text>
                        <Text>6</Text>
                        <Text>12</Text>
                        <Text>18</Text>
                        <Text>24+ Monate</Text>
                      </Flex>
                    </Box>
                    
                    <Box 
                      bg="blue.50" 
                      p={4} 
                      borderRadius="md" 
                      fontSize="sm"
                      lineHeight="1.6"
                    >
                      <HStack mb={1}>
                        <InfoIcon color={`${getBreakevenColor(breakEvenMonths)}.500`} />
                        <Text fontWeight="medium" color={`${getBreakevenColor(breakEvenMonths)}.700`}>
                          ROI Analyse
                        </Text>
                      </HStack>
                      <Text>{getBreakevenMessage(breakEvenMonths)}</Text>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            )}

            <Flex justifyContent="center" mt={8}>
              <Button
                leftIcon={<Icon as={FileDownIcon} />}
                colorScheme="blue"
                size="lg"
                borderRadius="full"
                width={{ base: "full", md: "auto" }}
                maxWidth="300px"
                boxShadow="md"
                _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
              >
                Bericht herunterladen
              </Button>
            </Flex>
          </>
        )}
      </Box>
    </Container>
  );
}

export default ROICalculator;