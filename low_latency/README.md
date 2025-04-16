# Low-Latency Java Programming Labs

This repository contains a series of exercises designed to teach low-latency programming techniques in Java, with a focus on high-frequency trading and financial systems.

## Project Structure

The project is organized into the following directories:

- **[Exercise 1: High-Performance Order Book Simulator](./exercise1_order_book)** - Build an order book with optimized memory management
- **[Exercise 2: Low-Latency Message Queue](./exercise2_message_queue)** - Implement a lock-free queue for high-throughput message passing
- **[Exercise 3: Latency-Sensitive Metrics Aggregator](./exercise3_metrics_aggregator)** - Create a system to collect performance metrics with minimal overhead
- **[Exercise 4: Low-Latency Trading Signal Processor](./exercise4_signal_processor)** - Process market data and generate trading signals with minimal latency
- **[Exercise 5: Custom Memory Allocator](./exercise5_memory_allocator)** - Implement a custom memory allocator to reduce GC overhead
- **[Memory Management Techniques](./memory_management)** - Advanced memory management strategies for low-latency Java applications

## Getting Started

Each exercise directory contains a README.md file with:
- Exercise description and objectives
- Step-by-step tasks
- Key low-latency techniques to implement
- Sample code skeletons
- Challenges and potential enhancements

To begin, select an exercise and follow the instructions in its README.

## Prerequisites

- Java 11 or higher
- Maven or Gradle for dependency management
- Familiarity with Java concurrency primitives
- Basic understanding of financial markets (for exercises 1 and 4)

## Learning Path

For the best learning experience, it's recommended to complete the exercises in the following order:

1. Exercise 1: High-Performance Order Book Simulator
2. Exercise 3: Latency-Sensitive Metrics Aggregator
3. Exercise 2: Low-Latency Message Queue
4. Exercise 4: Low-Latency Trading Signal Processor
5. Exercise 5: Custom Memory Allocator

The Memory Management section provides reference material that will be useful throughout all exercises.

## Performance Goals

These exercises aim to help you build systems with:
- Sub-microsecond latency
- Minimal garbage collection pauses
- Consistent performance under high load
- Efficient memory usage

## Additional Resources

For more information on low-latency programming in Java, check out these resources:

- [Mechanical Sympathy](https://mechanical-sympathy.blogspot.com/) - Martin Thompson's blog on low-latency systems
- [Java Concurrency in Practice](https://jcip.net/) - Essential book on Java concurrency
- [Chronicle Software](https://chronicle.software/) - Commercial low-latency Java libraries
- [JCTools](https://github.com/JCTools/JCTools) - Java Concurrent Tools for high-performance concurrency
- [LMAX Disruptor](https://github.com/LMAX-Exchange/disruptor) - High-performance inter-thread messaging library 