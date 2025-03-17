import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  Box,
  Flex,
  Heading,
  Text,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  Stack,
  VStack,
  HStack,
  Grid,
  GridItem,
  Badge,
  Progress,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Divider,
  Switch,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Alert,
  AlertIcon,
  RadioGroup,
  Radio,
  Container
} from '@chakra-ui/react';
import {
  SettingsIcon,
  DownloadIcon,
  InfoIcon,
  ChevronDownIcon,
  TimeIcon,
  CheckIcon
} from '@chakra-ui/icons';
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import create from 'zustand';

// Define colors for our theme
const colorScheme = {
  primary: {
    50: '#FFF8E6',
    100: '#FFEFC3',
    200: '#FFE59F',
    300: '#FFDB7B',
    400: '#FFD157',
    500: '#F0B422', // Primary color
    600: '#D9A41F',
    700: '#B7881A',
    800: '#956C15',
    900: '#7A5412',
  },
  secondary: {
    50: '#E6ECF5',
    100: '#C2D0E5',
    200: '#9DB4D5',
    300: '#7897C5',
    400: '#537BB5',
    500: '#253A6F', // Secondary color
    600: '#213464',
    700: '#1C2C55',
    800: '#172446',
    900: '#121C37',
  }
};

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

// Create state store with Zustand
const useStore = create((set) => ({
  // Patient counts
  statutoryPatients: 20,
  privatePatients: 5,
  selfPayPatients: 10,
  
  // Sessions per patient
  statutorySessions: 6,
  privateSessions: 6,
  
  // Self-pay package selection
  selectedPackage: "twentyPackage",
  
  // Advanced options
  showAdvancedOptions: false,
  systemCost: AVERAGE_SYSTEM_COST,
  monthlyExpenses: 500,
  
  // Results
  statutoryRevenue: 0,
  privateRevenue: 0,
  selfPayRevenue: 0,
  totalRevenue: 0,
  breakEvenMonths: 0,
  showResults: false,
  
  // Actions
  setStatutoryPatients: (value) => set({ statutoryPatients: value }),
  setPrivatePatients: (value) => set({ privatePatients: value }),
  setSelfPayPatients: (value) => set({ selfPayPatients: value }),
  setStatutorySessions: (value) => set({ statutorySessions: value }),
  setPrivateSessions: (value) => set({ privateSessions: value }),
  setSelectedPackage: (value) => set({ selectedPackage: value }),
  setShowAdvancedOptions: (value) => set({ showAdvancedOptions: value }),
  setSystemCost: (value) => set({ systemCost: value }),
  setMonthlyExpenses: (value) => set({ monthlyExpenses: value }),
  
  // Calculate function
  calculateResults: () => {
    const {
      statutoryPatients,
      privatePatients,
      selfPayPatients,
      statutorySessions,
      privateSessions,
      selectedPackage,
      monthlyExpenses,
      systemCost
    } = useStore.getState();
    
    // Calculate revenue for statutory patients
    const statRevenue = statutoryPatients * statutorySessions * STATUTORY_FEE;
    
    // Calculate revenue for private patients
    const privRevenue = privatePatients * privateSessions * PRIVATE_FEE;
    
    // Calculate revenue for self-pay patients
    const selectedPkg = SELF_PAY_PACKAGES[selectedPackage];
    const selfRevenue = selfPayPatients * selectedPkg.price;
    
    // Calculate total revenue
    const total = statRevenue + privRevenue + selfRevenue;
    
    // Calculate break-even period (in months)
    const monthlyRevenue = total - monthlyExpenses;
    const breakEven = monthlyRevenue > 0 ? Math.ceil(systemCost / monthlyRevenue) : 0;
    
    set({
      statutoryRevenue: statRevenue,
      privateRevenue: privRevenue,
      selfPayRevenue: selfRevenue,
      totalRevenue: total,
      breakEvenMonths: breakEven,
      showResults: true
    });
    
    // Scroll to results after render
    setTimeout(() => {
      const resultsSection = document.getElementById("results-section");
      if (resultsSection) {
        resultsSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);
  }
}));

// Format currency helper
const formatCurrency = (value) => {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(value);
};

// The main calculator component
function ROICalculator() {
  // Use form hook for validation
  const { control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      statutoryPatients: 20,
      privatePatients: 5,
      selfPayPatients: 10,
      statutorySessions: 6,
      privateSessions: 6,
      systemCost: AVERAGE_SYSTEM_COST,
      monthlyExpenses: 500
    }
  });
  
  // Get state from store
  const state = useStore(state => state);
  
  // Card background color 
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Data for pie chart
  const chartData = [
    { name: 'Gesetzlich', value: state.statutoryRevenue, color: '#253A6F' },
    { name: 'Privat', value: state.privateRevenue, color: '#3E5899' },
    { name: 'Selbstzahler', value: state.selfPayRevenue, color: '#F0B422' },
  ];

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 }
    }
  };
  
  // Submit handler
  const onSubmit = (data) => {
    // Update store with form data
    Object.entries(data).forEach(([key, value]) => {
      if (typeof state[`set${key.charAt(0).toUpperCase() + key.slice(1)}`] === 'function') {
        state[`set${key.charAt(0).toUpperCase() + key.slice(1)}`](value);
      }
    });
    
    // Calculate results
    state.calculateResults();
  };

  return (
    <ChakraProvider>
      <Container maxW="1000px" py={8}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card mb={8} borderColor={borderColor} boxShadow="sm">
                <CardHeader bg="white" borderBottomWidth="1px" position="relative" _after={{
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '4px',
                  height: '100%',
                  bg: 'primary.500'
                }}>
                  <Heading size="md" color="secondary.500">Patienteninformationen</Heading>
                  <Text color="gray.600" fontSize="sm">
                    Geben Sie die Patientendaten Ihrer Praxis ein, um den potenziellen Umsatz zu berechnen
                  </Text>
                </CardHeader>
  
                <CardBody p={6}>
                  <Stack spacing={8}>
                    {/* Statutory Health Insurance Patients */}
                    <Box>
                      <Heading size="sm" mb={4} color="secondary.500" pb={2} borderBottomWidth="2px" borderBottomColor="primary.500" width="fit-content">
                        Gesetzlich versicherte Patienten
                      </Heading>
                      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                        <GridItem>
                          <VStack align="start" spacing={2}>
                            <Text fontWeight="medium">Anzahl der Patienten</Text>
                            <Controller
                              name="statutoryPatients"
                              control={control}
                              rules={{ required: true, min: 0 }}
                              render={({ field }) => (
                                <NumberInput
                                  {...field}
                                  min={0}
                                  w="100%"
                                  focusBorderColor="primary.500"
                                >
                                  <NumberInputField />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                              )}
                            />
                            <Text fontSize="sm" color="gray.500">
                              Gebühr pro Sitzung: {formatCurrency(STATUTORY_FEE)}
                            </Text>
                          </VStack>
                        </GridItem>
                        <GridItem>
                          <VStack align="start" spacing={2}>
                            <Text fontWeight="medium">Durchschnittliche Sitzungen pro Patient</Text>
                            <Controller
                              name="statutorySessions"
                              control={control}
                              rules={{ required: true, min: 1 }}
                              render={({ field }) => (
                                <NumberInput
                                  {...field}
                                  min={1}
                                  w="100%"
                                  focusBorderColor="primary.500"
                                >
                                  <NumberInputField />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                              )}
                            />
                          </VStack>
                        </GridItem>
                      </Grid>
                    </Box>
  
                    {/* Private Patients */}
                    <Box>
                      <Heading size="sm" mb={4} color="secondary.500" pb={2} borderBottomWidth="2px" borderBottomColor="primary.500" width="fit-content">
                        Privatpatienten
                      </Heading>
                      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                        <GridItem>
                          <VStack align="start" spacing={2}>
                            <Text fontWeight="medium">Anzahl der Patienten</Text>
                            <Controller
                              name="privatePatients"
                              control={control}
                              rules={{ required: true, min: 0 }}
                              render={({ field }) => (
                                <NumberInput
                                  {...field}
                                  min={0}
                                  w="100%"
                                  focusBorderColor="primary.500"
                                >
                                  <NumberInputField />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                              )}
                            />
                            <Text fontSize="sm" color="gray.500">
                              Gebühr pro Sitzung: {formatCurrency(PRIVATE_FEE)}
                            </Text>
                          </VStack>
                        </GridItem>
                        <GridItem>
                          <VStack align="start" spacing={2}>
                            <Text fontWeight="medium">Durchschnittliche Sitzungen pro Patient</Text>
                            <Controller
                              name="privateSessions"
                              control={control}
                              rules={{ required: true, min: 1 }}
                              render={({ field }) => (
                                <NumberInput
                                  {...field}
                                  min={1}
                                  w="100%"
                                  focusBorderColor="primary.500"
                                >
                                  <NumberInputField />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                              )}
                            />
                          </VStack>
                        </GridItem>
                      </Grid>
                    </Box>
  
                    {/* Self-Pay Patients */}
                    <Box>
                      <Heading size="sm" mb={4} color="secondary.500" pb={2} borderBottomWidth="2px" borderBottomColor="primary.500" width="fit-content">
                        Selbstzahler
                      </Heading>
                      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                        <GridItem>
                          <VStack align="start" spacing={2}>
                            <Text fontWeight="medium">Anzahl der Patienten</Text>
                            <Controller
                              name="selfPayPatients"
                              control={control}
                              rules={{ required: true, min: 0 }}
                              render={({ field }) => (
                                <NumberInput
                                  {...field}
                                  min={0}
                                  w="100%"
                                  focusBorderColor="primary.500"
                                >
                                  <NumberInputField />
                                  <NumberInputStepper>
                                    <NumberIncrementStepper />
                                    <NumberDecrementStepper />
                                  </NumberInputStepper>
                                </NumberInput>
                              )}
                            />
                          </VStack>
                        </GridItem>
                        <GridItem>
                          <VStack align="start" spacing={2} width="100%">
                            <Text fontWeight="medium">Paketauswahl</Text>
                            <RadioGroup 
                              value={state.selectedPackage} 
                              onChange={state.setSelectedPackage}
                              width="100%"
                            >
                              <Stack spacing={3} width="100%">
                                {Object.entries(SELF_PAY_PACKAGES).map(([key, pkg]) => (
                                  <Card
                                    key={key}
                                    borderWidth="1px"
                                    borderColor={state.selectedPackage === key ? "primary.500" : "gray.200"}
                                    bg={state.selectedPackage === key ? "primary.50" : "white"}
                                    borderRadius="md"
                                    overflow="hidden"
                                    transition="all 0.2s"
                                    _hover={{
                                      borderColor: "primary.500",
                                      transform: "translateY(-2px)",
                                      boxShadow: "sm"
                                    }}
                                    cursor="pointer"
                                    onClick={() => state.setSelectedPackage(key)}
                                  >
                                    <Flex p={3} alignItems="center">
                                      <Radio 
                                        value={key} 
                                        colorScheme="primary"
                                        mr={3}
                                      />
                                      <Flex direction="column">
                                        <Text fontWeight="medium">
                                          {pkg.name} - {formatCurrency(pkg.price)}
                                        </Text>
                                        <Text fontSize="sm" color="gray.500">
                                          ({formatCurrency(pkg.price / pkg.sessions)} pro Sitzung)
                                        </Text>
                                      </Flex>
                                    </Flex>
                                  </Card>
                                ))}
                              </Stack>
                            </RadioGroup>
                          </VStack>
                        </GridItem>
                      </Grid>
                    </Box>
  
                    {/* Advanced Options */}
                    <Card bg="gray.50" p={4} borderRadius="lg" borderWidth="1px" borderColor="gray.200">
                      <HStack justifyContent="space-between" alignItems="center" mb={state.showAdvancedOptions ? 4 : 0}>
                        <HStack>
                          <SettingsIcon color="primary.500" />
                          <Text fontWeight="medium" color="secondary.500">Erweiterte Optionen anzeigen</Text>
                        </HStack>
                        <Switch 
                          isChecked={state.showAdvancedOptions}
                          onChange={(e) => state.setShowAdvancedOptions(e.target.checked)}
                          colorScheme="primary"
                        />
                      </HStack>
  
                      <AnimatePresence>
                        {state.showAdvancedOptions && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Divider my={4} />
                            <Stack spacing={4}>
                              <VStack align="start" spacing={2}>
                                <Text fontWeight="medium">reLounge Systemkosten (€)</Text>
                                <Controller
                                  name="systemCost"
                                  control={control}
                                  rules={{ required: true, min: 0 }}
                                  render={({ field }) => (
                                    <NumberInput
                                      {...field}
                                      min={0}
                                      w="100%"
                                      focusBorderColor="primary.500"
                                    >
                                      <NumberInputField />
                                      <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                      </NumberInputStepper>
                                    </NumberInput>
                                  )}
                                />
                              </VStack>
                              <VStack align="start" spacing={2}>
                                <Text fontWeight="medium">Monatliche Betriebskosten (€)</Text>
                                <Controller
                                  name="monthlyExpenses"
                                  control={control}
                                  rules={{ required: true, min: 0 }}
                                  render={({ field }) => (
                                    <NumberInput
                                      {...field}
                                      min={0}
                                      w="100%"
                                      focusBorderColor="primary.500"
                                    >
                                      <NumberInputField />
                                      <NumberInputStepper>
                                        <NumberIncrementStepper />
                                        <NumberDecrementStepper />
                                      </NumberInputStepper>
                                    </NumberInput>
                                  )}
                                />
                                <Text fontSize="sm" color="gray.500">
                                  Inklusive Strom, Wartung, etc.
                                </Text>
                              </VStack>
                            </Stack>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Card>
  
                    {/* Calculate Button */}
                    <Flex justifyContent="center" mt={4}>
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        borderRadius="full"
                        px={8}
                        rightIcon={<ChevronDownIcon />}
                        _hover={{
                          transform: "translateY(-2px)",
                          boxShadow: "lg"
                        }}
                        _active={{
                          transform: "translateY(0)",
                          boxShadow: "md"
                        }}
                      >
                        Ergebnisse berechnen
                      </Button>
                    </Flex>
                  </Stack>
                </CardBody>
              </Card>
            </motion.div>
  
            {/* Results Section */}
            <AnimatePresence>
              {state.showResults && (
                <motion.div
                  id="results-section"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <Box textAlign="center" mb={6}>
                    <Badge
                      colorScheme="primary"
                      px={4}
                      py={2}
                      borderRadius="full"
                      fontSize="md"
                    >
                      <HStack spacing={2}>
                        <ChevronDownIcon />
                        <Text>Ihre Ergebnisse</Text>
                      </HStack>
                    </Badge>
                  </Box>
  
                  <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} mb={6}>
                    {/* Revenue Overview */}
                    <GridItem>
                      <Card height="100%" boxShadow="sm">
                        <CardHeader borderBottom="1px solid" borderColor={borderColor} position="relative" _after={{
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          width: '4px',
                          height: '100%',
                          bg: 'primary.500'
                        }}>
                          <Heading size="md" color="secondary.500" display="flex" alignItems="center">
                            <InfoIcon color="primary.500" mr={2} /> Umsatzübersicht
                          </Heading>
                          <Text color="gray.600" fontSize="sm">
                            Geschätzter Umsatz basierend auf Ihren Eingaben
                          </Text>
                        </CardHeader>
  
                        <CardBody>
                          <VStack spacing={4} align="stretch">
                            <Flex justify="space-between">
                              <Text>Umsatz gesetzlich Versicherte:</Text>
                              <Text fontWeight="semibold" color="primary.500">{formatCurrency(state.statutoryRevenue)}</Text>
                            </Flex>
                            <Flex justify="space-between">
                              <Text>Umsatz Privatpatienten:</Text>
                              <Text fontWeight="semibold" color="primary.500">{formatCurrency(state.privateRevenue)}</Text>
                            </Flex>
                            <Flex justify="space-between">
                              <Text>Umsatz Selbstzahler:</Text>
                              <Text fontWeight="semibold" color="primary.500">{formatCurrency(state.selfPayRevenue)}</Text>
                            </Flex>
                            <Divider />
                            <Flex justify="space-between">
                              <Text fontWeight="bold">Gesamtumsatz:</Text>
                              <Text fontWeight="bold" color="primary.500" fontSize="lg">
                                {formatCurrency(state.totalRevenue)}
                              </Text>
                            </Flex>
  
                            {state.showAdvancedOptions && (
                              <Box mt={2}>
                                <Divider my={4} />
                                <Heading size="sm" mb={4}>Return on Investment</Heading>
                                <VStack spacing={3} align="stretch">
                                  <Flex justify="space-between">
                                    <Text>Systemkosten:</Text>
                                    <Text>{formatCurrency(state.systemCost)}</Text>
                                  </Flex>
                                  <Flex justify="space-between">
                                    <Text>Monatliche Betriebskosten:</Text>
                                    <Text>{formatCurrency(state.monthlyExpenses)}</Text>
                                  </Flex>
                                  <Flex justify="space-between">
                                    <Text>Monatlicher Nettoertrag:</Text>
                                    <Text fontWeight="semibold" color="primary.500">
                                      {formatCurrency(state.totalRevenue - state.monthlyExpenses)}
                                    </Text>
                                  </Flex>
                                  <Flex justify="space-between">
                                    <Text>Geschätzte Amortisationszeit:</Text>
                                    <Text fontWeight="semibold" color="primary.500">
                                      {state.breakEvenMonths > 0 ? `${state.breakEvenMonths} Monate` : "N/A"}
                                    </Text>
                                  </Flex>
                                </VStack>
                              </Box>
                            )}
                          </VStack>
                        </CardBody>
                      </Card>
                    </GridItem>
  
                    {/* Revenue Visualization */}
                    <GridItem>
                      <Card height="100%" boxShadow="sm">
                        <CardHeader borderBottom="1px solid" borderColor={borderColor} position="relative" _after={{
                          content: '""',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          width: '4px',
                          height: '100%',
                          bg: 'primary.500'
                        }}>
                          <Heading size="md" color="secondary.500" display="flex" alignItems="center">
                            <InfoIcon color="primary.500" mr={2} /> Umsatzvisualisierung
                          </Heading>
                          <Text color="gray.600" fontSize="sm">
                            Grafische Darstellung Ihrer Umsatzströme
                          </Text>
                        </CardHeader>
  
                        <CardBody>
                          <Box height="300px" display="flex" alignItems="center" justifyContent="center">
                            {state.totalRevenue > 0 ? (
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                    animationDuration={750}
                                    animationBegin={0}
                                  >
                                    {chartData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                  <RechartsTooltip 
                                    formatter={(value) => formatCurrency(value)} 
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            ) : (
                              <Box textAlign="center" p={6} bg="gray.50" width="100%" borderRadius="md">
                                <Text color="gray.500" fontStyle="italic">
                                  Geben Sie Patientendaten ein, um die Umsatzvisualisierung zu sehen
                                </Text>
                              </Box>
                            )}
                          </Box>
                        </CardBody>
                      </Card>
                    </GridItem>
                  </Grid>
  
                  {/* Breakeven Analysis */}
                  {state.showAdvancedOptions && state.breakEvenMonths > 0 && (
                    <Card mb={6} boxShadow="sm">
                      <CardHeader borderBottom="1px solid" borderColor={borderColor} position="relative" _after={{
                        content: '""',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        width: '4px',
                        height: '100%',
                        bg: 'primary.500'
                      }}>
                        <Heading size="md" color="secondary.500" display="flex" alignItems="center">
                          <TimeIcon color="primary.500" mr={2} /> Amortisationsanalyse
                        </Heading>
                        <Text color="gray.600" fontSize="sm">
                          Visualisierung Ihres Return on Investment im Zeitverlauf
                        </Text>
                      </CardHeader>
  
                      <CardBody>
                        <Box p={4}>
                          <Flex justify="space-between" mb={3}>
                            <Badge colorScheme="secondary">
                              {Math.min(100, Math.round((state.breakEvenMonths / 24) * 100))}% bis zur Amortisation
                            </Badge>
                            <Text fontWeight="semibold" color="secondary.500">{state.breakEvenMonths} Monate</Text>
                          </Flex>
  
                          <Box mb={3}>
                            <Progress 
                              value={Math.min(100, (state.breakEvenMonths / 24) * 100)} 
                              colorScheme="primary" 
                              borderRadius="full"
                              height="10px"
                              bg="gray.100"
                            />
                          </Box>
  
                          <Flex justify="space-between" mb={6} fontSize="xs" color="gray.500">
                            <Text>0</Text>
                            <Text>6</Text>
                            <Text>12</Text>
                            <Text>18</Text>
                            <Text>24+ Monate</Text>
                          </Flex>
  
                          <Alert
                            status={state.breakEvenMonths <= 8 ? "success" : state.breakEvenMonths <= 14 ? "info" : "warning"}
                            variant="subtle"
                            borderRadius="md"
                          >
                            <AlertIcon />
                            {state.breakEvenMonths <= 8 ? (
                              <Text>
                                Ihre geschätzte Amortisationszeit ist hervorragend! Mit {state.breakEvenMonths} Monaten werden Sie
                                schneller als der typische Zeitraum von 8-14 Monaten einen Return on Investment sehen.
                              </Text>
                            ) : state.breakEvenMonths <= 14 ? (
                              <Text>
                                Ihre geschätzte Amortisationszeit von {state.breakEvenMonths} Monaten liegt im typischen Bereich von
                                8-14 Monaten für reLounge-Systeme.
                              </Text>
                            ) : (
                              <Text>
                                Ihre geschätzte Amortisationszeit von {state.breakEvenMonths} Monaten ist länger als der typische
                                Bereich von 8-14 Monaten. Erwägen Sie eine Anpassung Ihres Patientenmix oder der
                                Paketangebote, um den ROI zu verbessern.
                              </Text>
                            )}
                          </Alert>
                        </Box>
                      </CardBody>
                    </Card>
                  )}
  
                  {/* Download Button */}
                  <Flex justify="center" mb={8}>
                    <Button
                      leftIcon={<DownloadIcon />}
                      colorScheme="secondary"
                      variant="solid"
                      size="lg"
                      borderRadius="full"
                      px={8}
                      _hover={{
                        transform: "translateY(-2px)",
                        boxShadow: "lg"
                      }}
                      _active={{
                        transform: "translateY(0)",
                        boxShadow: "md"
                      }}
                    >
                      Bericht herunterladen
                    </Button>
                  </Flex>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </form>
      </Container>
    </ChakraProvider>
  );
}

export default ROICalculator;