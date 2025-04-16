# Exercise 3: Latency-Sensitive Metrics Aggregator

**Objective**: Build a low-latency system to collect and aggregate metrics (e.g., latency, throughput) in real-time.

## Description
Low-latency systems often need to monitor their performance without introducing overhead. This exercise builds a metrics aggregator that collects and summarizes data (e.g., average latency, percentiles) with minimal impact on the main application.

## Tasks
- Implement a thread-safe metrics collector that records latency measurements.
- Use a HdrHistogram (from org.HdrHistogram) for high-precision latency tracking.
- Minimize contention by using thread-local storage for initial data collection.
- Periodically aggregate metrics (e.g., every 1 second) and output percentiles (50th, 99th, 99.9th).
- Simulate a workload (e.g., random delays) to generate metrics.

## Key Low-Latency Techniques
- Use ThreadLocal to avoid contention during metric collection.
- Avoid allocations in the hot path; pre-allocate histograms.
- Use VarHandle or AtomicReference for thread-safe updates.

## Sample Code Skeleton
```java
import org.HdrHistogram.Histogram;

public class MetricsAggregator {
    private final ThreadLocal<Histogram> threadLocalHistogram = ThreadLocal.withInitial(() -> new Histogram(3));
    private final Histogram globalHistogram = new Histogram(3);

    public void recordLatency(long nanos) {
        threadLocalHistogram.get().recordValue(nanos);
    }

    public void aggregateAndReport() {
        globalHistogram.reset();
        threadLocalHistogram.get().add(threadLocalHistogram.get());
        System.out.println("99th percentile: " + globalHistogram.getValueAtPercentile(99.0) + " ns");
    }
}
```

## Challenge
- Optimize to handle 100 million measurements/second.
- Integrate with JMH (Java Microbenchmark Harness) to validate performance.

## Potential Enhancements with Advanced Memory Management
- **Optimized Thread-Local Storage**: Configure thread-local variables properly to avoid memory leaks.
- **Ring Buffer for Batching**: Use a ring buffer to batch measurements before processing.
- **Off-Heap Histograms**: Store histogram data in direct memory for very large data sets.
- **Memory-Mapped Files**: Persist metrics to disk using memory-mapped files for efficient I/O. 